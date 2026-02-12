"""
Routes d'authentification
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import Token, UserResponse, UserUpdate, ChangePasswordRequest
from app.services.auth import verify_password, create_access_token, hash_password
from app.services.user import get_user_by_email, update_user
from app.utils.security import get_current_user
from app.models import User
from app.services.agency import get_primary_agency_for_user

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authentifie un utilisateur et retourne un token JWT.

    - **username**: Email de l'utilisateur
    - **password**: Mot de passe
    """
    # Vérifier l'utilisateur
    user = get_user_by_email(db, email=form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Vérifier le mot de passe
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Créer le token
    access_token = create_access_token(data={"sub": str(user.id)})

    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retourne le profil de l'utilisateur connecté, enrichi avec l'agence principale.
    """
    primary_agency = get_primary_agency_for_user(db, current_user.id)
    response = UserResponse.model_validate(current_user)
    if primary_agency:
        response.agency_id = primary_agency.id
        response.agency_name = primary_agency.name
    return response


@router.patch("/me", response_model=UserResponse)
async def update_current_user_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Met à jour le profil de l'utilisateur connecté.
    """
    data = update_data.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")
    if "email" in data and data["email"] != current_user.email:
        existing = get_user_by_email(db, email=data["email"])
        if existing:
            raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe déjà")
    return update_user(db, user=current_user, update_data=data)


@router.post("/me/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Change le mot de passe de l'utilisateur connecté.
    """
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Mot de passe modifié avec succès"}
