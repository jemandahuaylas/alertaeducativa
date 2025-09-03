
"use client";

import { useState, useEffect, useMemo } from 'react';
import { PlusCircle, FileUp, Download, Users } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import type { UserProfile, UserProfileFormValues } from '@/core/domain/types';
import type { PersonnelFormValues } from '../components/docente-form';
import { DocenteForm } from '../components/docente-form';
import { ImportDocentesModal } from '../components/import-docentes-modal';
import ResourceToolbar from '@/components/organisms/resource-toolbar';
import ResourceListView from '@/components/organisms/resource-list-view';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import FloatingActionButton from '@/components/molecules/floating-action-button';
import { DownloadReportModal } from '@/components/organisms/download-report-modal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { usePersonnel } from '@/hooks/use-teachers';
import { useGradesAndSections } from '@/hooks/use-grades-and-sections';
import { TeacherDetailsModal } from '../components/teacher-details-modal';
import { PersonnelListCard } from '../components/personnel-list-card';
import { PersonnelGridCard } from '../components/personnel-grid-card';

const PERSONNEL_PER_PAGE = 10;

export default function GestionDocentesPage() {
  const { personnel, assignments } = usePersonnel();
  const { grades } = useGradesAndSections();
  const { editProfile, deleteProfile, addProfile } = useAppContext();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<UserProfile | undefined>(undefined);
  const [personnelToView, setPersonnelToView] = useState<UserProfile | null>(null);
  const [personnelToDelete, setPersonnelToDelete] = useState<UserProfile | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [visiblePersonnelCount, setVisiblePersonnelCount] = useState(PERSONNEL_PER_PAGE);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAdd = () => {
    setSelectedPersonnel(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (person: UserProfile) => {
    setSelectedPersonnel(person);
    setIsFormOpen(true);
  };

  const handleViewDetails = (person: UserProfile) => {
    setPersonnelToView(person);
    setIsDetailsModalOpen(true);
  };

  const handleSave = async (personnelData: PersonnelFormValues) => {
    try {
        if (personnelData.id) {
            await editProfile(personnelData.id, personnelData);
            toast({ title: "Personal Actualizado", description: "Los datos del personal han sido actualizados." });
        } else {
            const dataToSave = {
              ...personnelData,
              password: personnelData.dni,
            };
            await addProfile(dataToSave);
            toast({ title: "Personal Creado", description: "El nuevo miembro del personal ha sido añadido y tiene acceso al sistema." });
        }
        setIsFormOpen(false);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error al guardar",
            description: error instanceof Error ? error.message : "No se pudo guardar el registro.",
        });
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (personnelToDelete) {
        await deleteProfile(personnelToDelete.id);
        setPersonnelToDelete(null);
    }
  };

  const handleImport = async (newPersonnel: Omit<UserProfile, 'id' | 'role' | 'name'>[]) => {
    // await importPersonnel(newPersonnel); // This needs to be adapted for the new user profile system
    setIsImportModalOpen(false);
  }

  const handleDownload = (format: 'pdf' | 'excel') => {
    const appName = "Alerta Educativa";
    const institutionName = "Mi Institución Educativa";
    const reportTitle = "Nómina de Personal";
    const fullTitle = `${appName} - ${reportTitle}`;
    const fileName = `Nómina_Personal - ${appName}`.replace(/\s+/g, '_');
    
    const data = personnel.map((p, i) => [String(i + 1), p.name, p.dni || '', p.email, p.role]);

    if (format === 'excel') {
        const worksheet = XLSX.utils.aoa_to_sheet([
            [fullTitle],
            [institutionName],
            [],
            ["#", "Nombre Completo", "DNI", "Correo Electrónico", "Rol"]
        ].concat(data));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Nómina Personal");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } else {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(fullTitle, 14, 15);
        doc.setFontSize(10);
        doc.text(institutionName, 14, 21);
        (doc as any).autoTable({
            startY: 28,
            head: [["#", "Nombre Completo", "DNI", "Correo Electrónico", "Rol"]],
            body: data,
        });
        doc.save(`${fileName}.pdf`);
    }
    setIsDownloadModalOpen(false);
  };


  const filteredPersonnel = useMemo(() => personnel.filter(person =>
    (person.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (person.email ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (person.dni ?? '').includes(searchQuery)
  ), [personnel, searchQuery]);
  
  const personnelAssignments = useMemo(() => {
    const assignmentsMap = new Map<string, { gradeName: string; sectionName: string }[]>();
    assignments.forEach(({ teacher_id, grade_id, section_id }) => {
      const grade = grades.find(g => g.id === grade_id);
      const section = grade?.sections.find(s => s.id === section_id);
      if (grade && section) {
        if (!assignmentsMap.has(teacher_id)) {
          assignmentsMap.set(teacher_id, []);
        }
        assignmentsMap.get(teacher_id)!.push({ gradeName: grade.name, sectionName: section.name });
      }
    });
    return assignmentsMap;
  }, [assignments, grades]);

  const personnelToShow = filteredPersonnel.slice(0, visiblePersonnelCount);
  const hasMorePersonnel = visiblePersonnelCount < filteredPersonnel.length;

  const handleLoadMore = () => {
    setVisiblePersonnelCount(prevCount => prevCount + PERSONNEL_PER_PAGE);
  };

  const pageActions = (
    <div className="flex items-center gap-2">
        <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setIsDownloadModalOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Descargar
        </Button>
        <Button variant="outline" className="hidden sm:flex" onClick={() => setIsImportModalOpen(true)}>
          <FileUp className="mr-2 h-4 w-4" />
          Importar
        </Button>
        <Button onClick={handleAdd} className="flex-1 sm:flex-none">
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Personal
        </Button>
    </div>
  );
  
  return (
    <>
      <PageHeader
        title="Gestionar Personal"
        actions={pageActions}
      />

      <ResourceToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre, correo o DNI..."
        view={view}
        onViewChange={setView}
        onFilterClick={() => alert('Los filtros para personal aún no están implementados.')}
        showFilterButton={false}
      />
      
       <ResourceListView
        items={personnelToShow}
        view={view}
        isLoading={!isClient}
        renderListItem={(person) => (
          <PersonnelListCard 
            item={person}
            onEdit={handleEdit}
            onDelete={setPersonnelToDelete}
            onViewDetails={handleViewDetails}
          />
        )}
        renderGridItem={(person) => (
            <PersonnelGridCard 
                item={person}
            />
        )}
        noResultsMessage="No hay personal que coincida con su búsqueda."
        listClassName="space-y-2"
      />

      {hasMorePersonnel && (
        <div className="mt-6 flex justify-center">
          <Button onClick={handleLoadMore} variant="outline">
            Cargar más
          </Button>
        </div>
      )}

      <FloatingActionButton 
        onClick={handleAdd} 
        icon={<Users className="h-6 w-6" />}
      />
      
      <DocenteForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSave}
        teacher={selectedPersonnel}
      />

      <ImportDocentesModal
        isOpen={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onImport={handleImport}
      />

      <TeacherDetailsModal
        isOpen={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        teacher={personnelToView}
        assignments={personnelToView ? personnelAssignments.get(personnelToView.id) || [] : []}
      />

      <DownloadReportModal
        isOpen={isDownloadModalOpen}
        onOpenChange={setIsDownloadModalOpen}
        onDownload={handleDownload}
        title="Descargar Nómina de Personal"
      />

      {personnelToDelete && (
        <AlertDialog open={!!personnelToDelete} onOpenChange={(open) => !open && setPersonnelToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta del sistema.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPersonnelToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
