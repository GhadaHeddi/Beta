"""
Service de gestion des biens comparables
"""
from typing import Optional, List, Dict, Any, Tuple
from dataclasses import dataclass
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from geoalchemy2.functions import ST_DWithin, ST_MakePoint, ST_SetSRID, ST_Distance
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
from app.models import ComparablePool, ComparableSource, TransactionType, Project, PropertyInfo, Comparable


def geocode_address(address: str) -> Optional[Tuple[float, float]]:
    """
    Geocode une adresse en coordonnees lat/lng via Nominatim (OpenStreetMap).
    Retourne (latitude, longitude) ou None si echec.
    """
    try:
        geolocator = Nominatim(user_agent="oryem-app", timeout=10)
        location = geolocator.geocode(address, country_codes="fr")
        if location:
            return (location.latitude, location.longitude)
        return None
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        print(f"Erreur geocodage pour '{address}': {e}")
        return None


def ensure_property_coordinates(db: Session, project_id: int) -> Optional[Tuple[float, float]]:
    """
    S'assure que le PropertyInfo du projet a des coordonnees.
    Si non, geocode l'adresse du projet et sauvegarde.
    Retourne (lat, lng) ou None.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project or not project.address:
        return None

    property_info = db.query(PropertyInfo).filter(
        PropertyInfo.project_id == project_id
    ).first()

    # Creer PropertyInfo si inexistant
    if not property_info:
        property_info = PropertyInfo(project_id=project_id)
        db.add(property_info)
        db.flush()

    # Si deja des coordonnees, les retourner
    if property_info.latitude and property_info.longitude:
        return (property_info.latitude, property_info.longitude)

    # Geocoder l'adresse du projet
    coords = geocode_address(project.address)
    if coords:
        property_info.latitude = coords[0]
        property_info.longitude = coords[1]
        db.commit()
        db.refresh(property_info)
        return coords

    return None


@dataclass
class ComparableSearchParams:
    """Parametres de recherche des comparables"""
    surface_min: Optional[float] = None
    surface_max: Optional[float] = None
    year_min: Optional[int] = None
    year_max: Optional[int] = None
    distance_km: float = 5.0
    source: Optional[str] = "all"


@dataclass
class PriceStats:
    """Statistiques de prix des comparables"""
    avg_rent_per_m2: Optional[float] = None
    rent_count: int = 0
    avg_sale_per_m2: Optional[float] = None
    sale_count: int = 0
    latest_sale_per_m2: Optional[float] = None
    latest_sale_date: Optional[date] = None
    total_count: int = 0


def search_comparables(
    db: Session,
    project_id: int,
    params: ComparableSearchParams
) -> Dict[str, Any]:
    """
    Recherche des biens comparables dans le pool selon les filtres.
    Le filtre par type de bien est automatique (meme type que le projet).

    Args:
        db: Session de base de donnees
        project_id: ID du projet
        params: Parametres de recherche

    Returns:
        Dict avec comparables, stats et center
    """
    # Recuperer le projet et ses infos
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return {"comparables": [], "stats": _empty_stats(), "center": None}

    property_info = db.query(PropertyInfo).filter(
        PropertyInfo.project_id == project_id
    ).first()

    if not property_info or not property_info.latitude or not property_info.longitude:
        return {"comparables": [], "stats": _empty_stats(), "center": None}

    # Coordonnees du bien evalue
    center_lat = property_info.latitude
    center_lng = property_info.longitude

    # Distance en metres
    distance_meters = params.distance_km * 1000

    # Construire la requete de base avec filtre par type de bien (AUTOMATIQUE)
    query = db.query(ComparablePool).filter(
        ComparablePool.property_type == project.property_type.value
    )

    # Filtre spatial avec PostGIS
    # ST_DWithin utilise la distance en metres pour Geography
    center_point = ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)
    query = query.filter(
        ST_DWithin(
            ComparablePool.geom,
            center_point,
            distance_meters
        )
    )

    # Appliquer les filtres de surface
    if params.surface_min:
        query = query.filter(ComparablePool.surface >= params.surface_min)
    if params.surface_max:
        query = query.filter(ComparablePool.surface <= params.surface_max)

    # Appliquer les filtres d'annee de construction
    if params.year_min:
        query = query.filter(ComparablePool.construction_year >= params.year_min)
    if params.year_max:
        query = query.filter(ComparablePool.construction_year <= params.year_max)

    # Appliquer le filtre de source
    if params.source and params.source != "all":
        if params.source == "arthur_loyd":
            query = query.filter(ComparablePool.source == ComparableSource.ARTHUR_LOYD)
        elif params.source == "concurrence":
            query = query.filter(ComparablePool.source == ComparableSource.CONCURRENCE)

    # Executer la requete
    comparables = query.all()

    # Calculer la distance pour chaque comparable
    comparables_with_distance = []
    for comp in comparables:
        distance_km = calculate_distance(
            center_lat, center_lng,
            comp.latitude, comp.longitude
        )
        comp_dict = {
            "id": comp.id,
            "address": comp.address,
            "postal_code": comp.postal_code,
            "city": comp.city,
            "latitude": comp.latitude,
            "longitude": comp.longitude,
            "property_type": comp.property_type,
            "surface": comp.surface,
            "construction_year": comp.construction_year,
            "transaction_type": comp.transaction_type.value,
            "price": comp.price,
            "price_per_m2": comp.price_per_m2,
            "transaction_date": comp.transaction_date.isoformat() if comp.transaction_date else None,
            "source": comp.source.value,
            "source_reference": comp.source_reference,
            "photo_url": comp.photo_url,
            "distance_km": round(distance_km, 2)
        }
        comparables_with_distance.append(comp_dict)

    # Calculer les statistiques
    stats = calculate_stats(comparables)

    return {
        "comparables": comparables_with_distance,
        "stats": stats,
        "center": {"lat": center_lat, "lng": center_lng}
    }


def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calcule la distance en km entre deux points (formule de Haversine simplifiee).
    """
    from math import radians, sin, cos, sqrt, atan2

    R = 6371  # Rayon de la Terre en km

    lat1_rad = radians(lat1)
    lat2_rad = radians(lat2)
    delta_lat = radians(lat2 - lat1)
    delta_lng = radians(lng2 - lng1)

    a = sin(delta_lat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lng / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c


def calculate_stats(comparables: List[ComparablePool]) -> Dict[str, Any]:
    """
    Calcule les statistiques de prix des comparables.
    """
    rentals = [c for c in comparables if c.transaction_type == TransactionType.RENT]
    sales = [c for c in comparables if c.transaction_type == TransactionType.SALE]

    stats = {
        "avg_rent_per_m2": None,
        "rent_count": len(rentals),
        "avg_sale_per_m2": None,
        "sale_count": len(sales),
        "latest_sale_per_m2": None,
        "latest_sale_date": None,
        "total_count": len(comparables)
    }

    if rentals:
        stats["avg_rent_per_m2"] = round(
            sum(c.price_per_m2 for c in rentals) / len(rentals), 2
        )

    if sales:
        stats["avg_sale_per_m2"] = round(
            sum(c.price_per_m2 for c in sales) / len(sales), 2
        )
        # Trouver la vente la plus recente
        latest_sale = max(sales, key=lambda x: x.transaction_date or date.min)
        if latest_sale.transaction_date:
            stats["latest_sale_per_m2"] = latest_sale.price_per_m2
            stats["latest_sale_date"] = latest_sale.transaction_date.isoformat()

    return stats


def _empty_stats() -> Dict[str, Any]:
    """Retourne des statistiques vides."""
    return {
        "avg_rent_per_m2": None,
        "rent_count": 0,
        "avg_sale_per_m2": None,
        "sale_count": 0,
        "latest_sale_per_m2": None,
        "latest_sale_date": None,
        "total_count": 0
    }


def get_selected_comparables(db: Session, project_id: int) -> List[Comparable]:
    """
    Recupere les comparables selectionnes pour un projet.
    """
    return db.query(Comparable).filter(
        Comparable.project_id == project_id,
        Comparable.validated == True
    ).all()


def select_comparable_from_pool(
    db: Session,
    project_id: int,
    pool_id: int,
    adjustment: float = 0.0,
    notes: Optional[str] = None
) -> Optional[Comparable]:
    """
    Selectionne un comparable du pool pour un projet.
    Cree une entree dans la table comparables liee au projet.

    Args:
        db: Session de base de donnees
        project_id: ID du projet
        pool_id: ID du comparable dans le pool
        adjustment: Ajustement en pourcentage
        notes: Notes de validation

    Returns:
        Le Comparable cree ou None si erreur
    """
    # Verifier le nombre de comparables deja selectionnes (max 3)
    existing_count = db.query(Comparable).filter(
        Comparable.project_id == project_id,
        Comparable.validated == True
    ).count()

    if existing_count >= 3:
        return None

    # Recuperer le comparable du pool
    pool_item = db.query(ComparablePool).filter(
        ComparablePool.id == pool_id
    ).first()

    if not pool_item:
        return None

    # Verifier si ce comparable n'est pas deja selectionne
    existing = db.query(Comparable).filter(
        Comparable.project_id == project_id,
        Comparable.source_reference == str(pool_id)
    ).first()

    if existing:
        return existing

    # Calculer le prix ajuste
    adjusted_price = pool_item.price_per_m2 * (1 + adjustment / 100)

    # Creer le comparable
    comparable = Comparable(
        project_id=project_id,
        address=pool_item.address,
        postal_code=pool_item.postal_code,
        city=pool_item.city,
        surface=pool_item.surface,
        price=pool_item.price,
        price_per_m2=pool_item.price_per_m2,
        latitude=pool_item.latitude,
        longitude=pool_item.longitude,
        transaction_date=pool_item.transaction_date,
        adjustment=adjustment,
        adjusted_price_per_m2=round(adjusted_price, 2),
        validated=True,
        validation_notes=notes,
        source=pool_item.source.value,
        source_reference=str(pool_item.id)
    )

    db.add(comparable)
    db.commit()
    db.refresh(comparable)

    return comparable


def deselect_comparable(db: Session, project_id: int, comparable_id: int) -> bool:
    """
    Retire un comparable de la selection du projet.

    Returns:
        True si supprime, False sinon
    """
    comparable = db.query(Comparable).filter(
        Comparable.id == comparable_id,
        Comparable.project_id == project_id
    ).first()

    if not comparable:
        return False

    db.delete(comparable)
    db.commit()

    return True


def update_comparable_adjustment(
    db: Session,
    project_id: int,
    comparable_id: int,
    adjustment: float
) -> Optional[Comparable]:
    """
    Met a jour l'ajustement d'un comparable.
    """
    comparable = db.query(Comparable).filter(
        Comparable.id == comparable_id,
        Comparable.project_id == project_id
    ).first()

    if not comparable:
        return None

    comparable.adjustment = adjustment
    comparable.adjusted_price_per_m2 = round(
        comparable.price_per_m2 * (1 + adjustment / 100), 2
    )

    db.commit()
    db.refresh(comparable)

    return comparable


def validate_project_comparables(db: Session, project_id: int) -> bool:
    """
    Valide les comparables selectionnes et avance le projet a l'etape suivante.

    Returns:
        True si succes
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        return False

    # Passer a l'etape 3 (Analyse) si on est a l'etape 2
    if project.current_step < 3:
        project.current_step = 3

    db.commit()

    return True
