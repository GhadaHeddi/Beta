"""
Service de gestion des biens comparables
"""
from typing import Optional, List, Dict, Any, Tuple
from dataclasses import dataclass
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
from app.models import ComparablePool, ComparableSource, TransactionType, ComparableStatus, Project, PropertyInfo, Comparable


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
    status: Optional[str] = "all"


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
    Retourne les stats pour 3 perimetres geographiques.

    Args:
        db: Session de base de donnees
        project_id: ID du projet
        params: Parametres de recherche

    Returns:
        Dict avec comparables, stats, perimeter_stats et center
    """
    empty_result = {
        "comparables": [], "stats": _empty_stats(),
        "perimeter_stats": _empty_perimeter_stats(),
        "center": None
    }

    # Recuperer le projet et ses infos
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return empty_result

    property_info = db.query(PropertyInfo).filter(
        PropertyInfo.project_id == project_id
    ).first()

    if not property_info or not property_info.latitude or not property_info.longitude:
        return empty_result

    # Coordonnees du bien evalue
    center_lat = property_info.latitude
    center_lng = property_info.longitude

    # Rayon max pour couvrir les 3 perimetres (agglomeration = 15km)
    max_radius_km = max(params.distance_km, 15.0)
    max_distance_meters = max_radius_km * 1000

    # Construire la requete de base avec filtre par type de bien (AUTOMATIQUE)
    query = db.query(ComparablePool).filter(
        ComparablePool.property_type == project.property_type.value
    )

    # Filtre spatial avec PostGIS — rayon max pour couvrir tous les perimetres
    query = query.filter(
        text("ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :dist)")
        .bindparams(lng=center_lng, lat=center_lat, dist=max_distance_meters)
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

    # Appliquer le filtre de statut
    if params.status and params.status != "all":
        query = query.filter(ComparablePool.status == params.status)

    # Executer la requete
    all_comparables = query.all()

    # Calculer la distance pour chaque comparable et construire les dicts
    comparables_with_distance = []
    for comp in all_comparables:
        dist_km = calculate_distance(
            center_lat, center_lng,
            comp.latitude, comp.longitude
        )
        comp._calc_distance_km = dist_km  # stocker temporairement pour les stats
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
            "transaction_type": comp.transaction_type.value if hasattr(comp.transaction_type, 'value') else comp.transaction_type,
            "price": comp.price,
            "price_per_m2": comp.price_per_m2,
            "transaction_date": comp.transaction_date.isoformat() if comp.transaction_date else None,
            "source": comp.source.value if hasattr(comp.source, 'value') else comp.source,
            "source_reference": comp.source_reference,
            "photo_url": comp.photo_url,
            "status": comp.status if isinstance(comp.status, str) else (comp.status.value if hasattr(comp.status, 'value') else "transaction"),
            "distance_km": round(dist_km, 2)
        }
        comparables_with_distance.append(comp_dict)

    # Filtrer pour la carte : uniquement les biens dans le rayon utilisateur
    filtered_comparables = [
        c for c in comparables_with_distance if c["distance_km"] <= params.distance_km
    ]

    # Calculer les stats globales (sur les biens filtres par distance utilisateur)
    filtered_pool = [c for c in all_comparables if c._calc_distance_km <= params.distance_km]
    stats = calculate_stats(filtered_pool)

    # Calculer les stats par perimetre
    # Recuperer la ville du projet pour le perimetre agglomeration
    project_city = None
    if property_info and hasattr(property_info, 'city') and property_info.city:
        project_city = property_info.city
    elif project.address:
        # Extraire la ville de l'adresse si possible
        project_city = _extract_city_from_address(project.address)

    # Agglomeration : meme ville
    agglo_comps = [c for c in all_comparables if c.city and project_city and c.city.lower() == project_city.lower()]
    agglo_stats = calculate_stats(agglo_comps)

    # Secteur : rayon 5km
    sector_comps = [c for c in all_comparables if c._calc_distance_km <= 5.0]
    sector_stats = calculate_stats(sector_comps)

    # Proximite : rayon du filtre distance utilisateur
    proximity_comps = filtered_pool
    proximity_stats = calculate_stats(proximity_comps)

    perimeter_stats = [
        {
            "label": f"Agglomeration — {project_city or 'N/A'}",
            "avg_rent_per_m2": agglo_stats["avg_rent_per_m2"],
            "avg_sale_per_m2": agglo_stats["avg_sale_per_m2"],
            "total_count": agglo_stats["total_count"]
        },
        {
            "label": "Secteur — 5 km",
            "avg_rent_per_m2": sector_stats["avg_rent_per_m2"],
            "avg_sale_per_m2": sector_stats["avg_sale_per_m2"],
            "total_count": sector_stats["total_count"]
        },
        {
            "label": f"Proximite — {params.distance_km} km",
            "avg_rent_per_m2": proximity_stats["avg_rent_per_m2"],
            "avg_sale_per_m2": proximity_stats["avg_sale_per_m2"],
            "total_count": proximity_stats["total_count"]
        }
    ]

    return {
        "comparables": filtered_comparables,
        "stats": stats,
        "perimeter_stats": perimeter_stats,
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


def _empty_perimeter_stats() -> List[Dict[str, Any]]:
    """Retourne des stats de perimetre vides."""
    return [
        {"label": "Agglomeration", "avg_rent_per_m2": None, "avg_sale_per_m2": None, "total_count": 0},
        {"label": "Secteur — 5 km", "avg_rent_per_m2": None, "avg_sale_per_m2": None, "total_count": 0},
        {"label": "Proximite", "avg_rent_per_m2": None, "avg_sale_per_m2": None, "total_count": 0},
    ]


def _extract_city_from_address(address: str) -> Optional[str]:
    """Extrait la ville d'une adresse. Heuristique simple basee sur le code postal."""
    import re
    # Chercher un pattern "CODE_POSTAL VILLE" dans l'adresse
    match = re.search(r'\d{5}\s+(.+?)(?:,|$)', address)
    if match:
        return match.group(1).strip()
    # Sinon, prendre le dernier element apres la virgule
    parts = address.split(',')
    if len(parts) >= 2:
        last_part = parts[-1].strip()
        # Enlever le code postal si present
        city = re.sub(r'^\d{5}\s*', '', last_part)
        return city.strip() if city.strip() else None
    return None


def quick_add_comparable(
    db: Session,
    project_id: int,
    address: str,
    surface: float,
    price: float,
    construction_year: Optional[int] = None
) -> Optional[ComparablePool]:
    """
    Ajout rapide d'un bien comparable au pool.
    Geocode l'adresse, cree un ComparablePool avec source Arthur Loyd.

    Returns:
        Le ComparablePool cree ou None si geocodage echoue
    """
    # Recuperer le projet pour le property_type
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return None

    # Geocoder l'adresse
    coords = geocode_address(address)
    if not coords:
        return None

    lat, lng = coords
    price_per_m2 = round(price / surface, 2)

    # Creer le comparable
    new_comparable = ComparablePool(
        address=address,
        latitude=lat,
        longitude=lng,
        geom=func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326),
        property_type=project.property_type.value,
        surface=surface,
        construction_year=construction_year,
        transaction_type=TransactionType.SALE,
        price=price,
        price_per_m2=price_per_m2,
        transaction_date=date.today(),
        source=ComparableSource.ARTHUR_LOYD,
        status="disponible",
    )

    db.add(new_comparable)
    db.commit()
    db.refresh(new_comparable)

    return new_comparable


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

    # Calculer la distance par rapport au bien evalue
    distance_km = None
    property_info = db.query(PropertyInfo).filter(
        PropertyInfo.project_id == project_id
    ).first()
    if property_info and property_info.latitude and property_info.longitude:
        distance_km = round(calculate_distance(
            property_info.latitude, property_info.longitude,
            pool_item.latitude, pool_item.longitude
        ), 2)

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
        construction_year=pool_item.construction_year,
        distance=distance_km,
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


def update_comparable_fields(
    db: Session,
    project_id: int,
    comparable_id: int,
    surface: Optional[float] = None,
    price: Optional[float] = None,
    price_per_m2: Optional[float] = None,
    construction_year: Optional[int] = None
) -> Optional[Comparable]:
    """
    Met a jour les champs d'un comparable selectionne (surface, prix, prix/m2, annee).
    Si price_per_m2 est fourni directement, recalcule price = price_per_m2 * surface.
    Sinon, recalcule price_per_m2 = price / surface.
    """
    comparable = db.query(Comparable).filter(
        Comparable.id == comparable_id,
        Comparable.project_id == project_id
    ).first()

    if not comparable:
        return None

    if surface is not None:
        comparable.surface = surface
    if price is not None:
        comparable.price = price
    if construction_year is not None:
        comparable.construction_year = construction_year

    if price_per_m2 is not None:
        # L'utilisateur modifie directement le prix/m2 : recalculer le prix total
        comparable.price_per_m2 = price_per_m2
        if comparable.surface and comparable.surface > 0:
            comparable.price = round(price_per_m2 * comparable.surface, 2)
    else:
        # Recalculer price_per_m2 a partir de price et surface
        if comparable.surface and comparable.surface > 0:
            comparable.price_per_m2 = round(comparable.price / comparable.surface, 2)

    # Recalculer adjusted_price_per_m2 avec l'adjustment existant
    comparable.adjusted_price_per_m2 = round(
        comparable.price_per_m2 * (1 + comparable.adjustment / 100), 2
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
