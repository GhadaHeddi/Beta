/**
 * Hook pour la gestion des projets
 */
import { useState, useCallback } from 'react';
import { projectsApi, Project, ProjectCreate, PropertyType } from '@/services/api';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectsApi.list();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (data: ProjectCreate): Promise<Project | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newProject = await projectsApi.create(data);
      setProjects(prev => [newProject, ...prev]);
      setCurrentProject(newProject);
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du projet');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProject = useCallback(async (id: number): Promise<Project | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const project = await projectsApi.get(id);
      setCurrentProject(project);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du projet');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: number, data: Partial<Project>): Promise<Project | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await projectsApi.update(id, data);
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
      if (currentProject?.id === id) {
        setCurrentProject(updated);
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du projet');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  const deleteProject = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await projectsApi.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du projet');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  // Convertir le type de propriété du frontend vers l'API
  const mapPropertyType = (frontendType: string): PropertyType => {
    const mapping: Record<string, PropertyType> = {
      'bureau': 'office',
      'entrepot': 'warehouse',
      'commerce': 'retail',
      'activite': 'industrial',
      'terrain': 'land',
      'mixte': 'mixed',
    };
    return mapping[frontendType.toLowerCase()] || 'office';
  };

  return {
    projects,
    currentProject,
    isLoading,
    error,
    fetchProjects,
    createProject,
    getProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    mapPropertyType,
  };
}
