
"use client";

import { useEffect, useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog, ResponsiveDialogContent, ResponsiveDialogDescription, ResponsiveDialogFooter, ResponsiveDialogHeader, ResponsiveDialogTitle } from '@/components/ui/responsive-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const initialAvailableGrades = ['1ro', '2do', '3ro', '4to', '5to', '6to'];

type GradeFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (grades: string[]) => void;
  existingGradeNames: string[];
};

export function GradeForm({ isOpen, onOpenChange, onSave, existingGradeNames }: GradeFormProps) {
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [customGrade, setCustomGrade] = useState('');
  
  const [availableGrades, setAvailableGrades] = useState(() => initialAvailableGrades.filter(g => !existingGradeNames.includes(g)));
  
  useEffect(() => {
    if (isOpen) {
      setSelectedGrades([]);
      setCustomGrade('');
      setAvailableGrades(initialAvailableGrades.filter(g => !existingGradeNames.includes(g)));
    }
  }, [isOpen, existingGradeNames]);

  const toggleGradeSelection = (gradeName: string) => {
    setSelectedGrades(prev =>
      prev.includes(gradeName)
        ? prev.filter(g => g !== gradeName)
        : [...prev, gradeName]
    );
  };

  const handleAddCustomGrade = () => {
    const newGrade = customGrade.trim();
    if (newGrade && !availableGrades.includes(newGrade) && !existingGradeNames.includes(newGrade)) {
      setAvailableGrades(prev => [...prev, newGrade]);
      setSelectedGrades(prev => [...prev, newGrade]);
      setCustomGrade('');
    }
  };

  const handleSubmit = () => {
    onSave(selectedGrades);
  };

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-[425px]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Crear Nuevos Grados</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Seleccione uno o más grados para añadirlos, o añada uno personalizado.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="space-y-6 py-4">
          {/* Grados Seleccionados */}
          {selectedGrades.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Grados Seleccionados ({selectedGrades.length})</Label>
              <div className="flex flex-wrap gap-2">
                {selectedGrades.map(grade => (
                  <Badge 
                    key={grade} 
                    variant="default" 
                    className="px-3 py-1.5 text-sm font-medium cursor-pointer hover:bg-primary/80 transition-colors"
                    onClick={() => toggleGradeSelection(grade)}
                  >
                    <Check className="w-3 h-3 mr-1.5" />
                    {grade}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Grados Sugeridos */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Grados Disponibles</Label>
            {availableGrades.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {availableGrades.map(grade => {
                  const isSelected = selectedGrades.includes(grade);
                  return (
                    <Button
                      key={grade}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        "h-10 text-sm font-medium transition-all duration-200",
                        isSelected 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "hover:bg-accent hover:text-accent-foreground border-input"
                      )}
                      onClick={() => toggleGradeSelection(grade)}
                    >
                      {isSelected && <Check className="w-3 h-3 mr-1.5" />}
                      {grade}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 px-4 border border-dashed border-muted-foreground/25 rounded-lg bg-muted/20">
                <p className="text-sm text-muted-foreground">Todos los grados sugeridos ya existen</p>
              </div>
            )}
          </div>

          {/* Añadir Grado Personalizado */}
          <div className="space-y-3">
            <Label htmlFor="custom-grade" className="text-sm font-medium text-foreground">Crear Grado Personalizado</Label>
            <div className="flex items-center gap-2.5">
              <Input
                id="custom-grade"
                value={customGrade}
                onChange={(e) => setCustomGrade(e.target.value)}
                placeholder="Ej: 7mo, Preescolar, etc."
                className="flex-1 h-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customGrade.trim()) {
                    handleAddCustomGrade();
                  }
                }}
              />
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                onClick={handleAddCustomGrade} 
                disabled={!customGrade.trim()}
                className="h-10 px-3 shrink-0"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Añadir
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Presiona Enter o haz clic en "Añadir" para crear un grado personalizado</p>
          </div>
        </div>
        <ResponsiveDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={selectedGrades.length === 0}
            className="w-full sm:w-auto"
          >
            {selectedGrades.length === 0 
              ? "Selecciona al menos un grado" 
              : `Crear ${selectedGrades.length} grado${selectedGrades.length > 1 ? 's' : ''}`
            }
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
