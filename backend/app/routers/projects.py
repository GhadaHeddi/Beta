"""
Router des projets - CRUD et gestion des avis de valeur
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.project import Project, PropertyType as DBPropertyType, ProjectStatus as DBProjectStatus
from app.models.property_info import PropertyInfo
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    PropertyInfoUpdate,
    PropertyInfoResponse,
)
from app.routers.auth import get_current_user

router = APIRouter()


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lister tous les projets de l'utilisateur connecté
    """
    projects = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.updated_at.desc()).all()
    return [ProjectResponse.model_validate(p) for p in projects]


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Créer un nouveau projet d'avis de valeur
    """
    # Convertir le type de propriété
    db_property_type = DBPropertyType(project_data.property_type.value)

    db_project = Project(
        user_id=current_user.id,
        title=project_data.title,
        address=project_data.address,
        property_type=db_property_type,
        status=DBProjectStatus.DRAFT,
        current_step=1,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    # Créer automatiquement les PropertyInfo vides
    db_property_info = PropertyInfo(project_id=db_project.id)
    db.add(db_property_info)
    db.commit()

    return ProjectResponse.model_validate(db_project)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupérer un projet par son ID
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    return ProjectResponse.model_validate(project)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour un projet
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    # Mettre à jour les champs fournis
    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "property_type" and value:
            setattr(project, field, DBPropertyType(value.value))
        elif field == "status" and value:
            setattr(project, field, DBProjectStatus(value.value))
        else:
            setattr(project, field, value)

    db.commit()
    db.refresh(project)

    return ProjectResponse.model_validate(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprimer un projet
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    db.delete(project)
    db.commit()

    return None


@router.get("/{project_id}/property-info", response_model=PropertyInfoResponse)
async def get_property_info(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupérer les informations de propriété d'un projet
    """
    # Vérifier que le projet appartient à l'utilisateur
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    property_info = db.query(PropertyInfo).filter(PropertyInfo.project_id == project_id).first()

    if not property_info:
        # Créer les PropertyInfo si elles n'existent pas
        property_info = PropertyInfo(project_id=project_id)
        db.add(property_info)
        db.commit()
        db.refresh(property_info)

    return PropertyInfoResponse.model_validate(property_info)


@router.put("/{project_id}/property-info", response_model=PropertyInfoResponse)
async def update_property_info(
    project_id: int,
    info_data: PropertyInfoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour les informations de propriété d'un projet
    """
    # Vérifier que le projet appartient à l'utilisateur
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    property_info = db.query(PropertyInfo).filter(PropertyInfo.project_id == project_id).first()

    if not property_info:
        # Créer les PropertyInfo si elles n'existent pas
        property_info = PropertyInfo(project_id=project_id)
        db.add(property_info)

    # Mettre à jour les champs fournis
    update_data = info_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(property_info, field, value)

    db.commit()
    db.refresh(property_info)

    return PropertyInfoResponse.model_validate(property_info)
