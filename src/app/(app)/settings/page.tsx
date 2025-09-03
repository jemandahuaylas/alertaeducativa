
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Palette, FileCheck, Stethoscope, UserMinus, Users, Shield, Edit, MoreHorizontal, User as UserIcon, Share2, AlertTriangle, Link as LinkIcon, Lock } from 'lucide-react';
import PageHeader from "@/components/page-header";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/use-settings';
import { Label } from '@/components/ui/label';
import { ResponsiveDropdownMenu, ResponsiveDropdownMenuContent, ResponsiveDropdownMenuItem, ResponsiveDropdownMenuTrigger } from '@/components/ui/responsive-dropdown-menu';
import { ResponsiveDialog, ResponsiveDialogContent, ResponsiveDialogDescription, ResponsiveDialogFooter, ResponsiveDialogHeader, ResponsiveDialogTitle } from '@/components/ui/responsive-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/context/app-context';
import type { UserProfile, UserProfileFormValues } from '@/core/domain/types';
import Link from 'next/link';

const customizationSchema = z.object({
  appName: z.string().min(1, "El nombre de la aplicación es obligatorio."),
  institutionName: z.string().min(1, "El nombre de la institución es obligatorio."),
  logoUrl: z.string().url("Debe ser una URL válida.").or(z.literal("")).optional(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Debe ser un código de color hexadecimal válido (p. ej. #FF5733)."),
});

type CustomizationFormValues = z.infer<typeof customizationSchema>;


const userSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "El nombre es obligatorio."),
    email: z.string().email("Dirección de correo electrónico no válida."),
    role: z.enum(['Admin', 'Director', 'Subdirector', 'Coordinador'], {
        required_error: "Debe seleccionar un rol."
    }),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional(),
}).refine(data => {
    // Si no hay 'id' (es un usuario nuevo), la contraseña es obligatoria.
    if (!data.id && !data.password) {
        return false;
    }
    return true;
}, {
    message: "La contraseña es obligatoria para nuevos usuarios.",
    path: ["password"],
});

type AdminUserFormValues = z.infer<typeof userSchema>;


function UserForm({ isOpen, onOpenChange, onSave, user }: { isOpen: boolean, onOpenChange: (isOpen: boolean) => void, onSave: (user: UserProfileFormValues) => void, user?: UserProfile }) {
    const getAdminDefaults = (user?: UserProfile): AdminUserFormValues => {
        if (user && ['Admin', 'Director', 'Subdirector', 'Coordinador'].includes(user.role)) {
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role as 'Admin' | 'Director' | 'Subdirector' | 'Coordinador',
                password: ''
            };
        }
        return { name: '', email: '', role: 'Coordinador', password: '' };
    };

    const form = useForm<AdminUserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: getAdminDefaults(user),
    });

    useEffect(() => {
        form.reset(getAdminDefaults(user));
    }, [user, isOpen, form]);

    const onSubmit = (data: AdminUserFormValues) => {
        onSave(data as UserProfileFormValues);
    };
    
    const isNewUser = !user;

    return (
        <ResponsiveDialog open={isOpen} onOpenChange={onOpenChange}>
            <ResponsiveDialogContent className="sm:max-w-[425px]">
                <ResponsiveDialogHeader>
                    <ResponsiveDialogTitle>{user ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</ResponsiveDialogTitle>
                    <ResponsiveDialogDescription>
                        {user ? 'Actualice los detalles del usuario.' : 'Introduzca los detalles del nuevo usuario.'}
                    </ResponsiveDialogDescription>
                </ResponsiveDialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="p. ej. Carlos Sánchez" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo Electrónico</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="p. ej. carlos.s@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Rol</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un rol" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                        <SelectItem value="Director">Director</SelectItem>
                                        <SelectItem value="Subdirector">Subdirector</SelectItem>
                                        <SelectItem value="Coordinador">Coordinador</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         {isNewUser && (
                           <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        )}
                        <ResponsiveDialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button type="submit">{user ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
                        </ResponsiveDialogFooter>
                    </form>
                </Form>
            </ResponsiveDialogContent>
        </ResponsiveDialog>
    );
}

function CustomizationForm() {
  const { settings, setSettings } = useSettings();

  const form = useForm<CustomizationFormValues>({
    resolver: zodResolver(customizationSchema),
    defaultValues: {
      appName: "Alerta Educativa",
      institutionName: "Mi Institución",
      logoUrl: "",
      primaryColor: "#1F618D",
    },
  });
  
  useEffect(() => {
    if (settings) {
        form.reset({
            appName: settings.appName || "Alerta Educativa",
            institutionName: settings.institutionName || "Mi Institución",
            logoUrl: settings.logoUrl || "",
            primaryColor: settings.primaryColor || "#1F618D",
        });
    }
  }, [settings, form]);


  async function onSubmit(data: CustomizationFormValues) {
    await setSettings(prev => ({ ...prev, ...data }));
    toast({
      title: "Guardado Exitoso",
      description: "Sus ajustes de personalización han sido guardados.",
    });
    window.location.reload();
  }
  
  const colorPresets = ["#1F618D", "#2ECC71", "#3498DB", "#9B59B6", "#F1C40F", "#E67E22", "#E74C3C"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="appName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Aplicación</FormLabel>
              <FormControl>
                <Input placeholder="p. ej. Sistema Escolar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="institutionName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Institución Educativa</FormLabel>
              <FormControl>
                <Input placeholder="p. ej. Colegio Mentes Brillantes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL del Logo</FormLabel>
              <FormControl>
                <div className="relative">
                  <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="url" 
                    placeholder="https://example.com/logo.png" 
                    className="pl-8"
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="primaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color Principal</FormLabel>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <FormControl>
                    <div className="relative flex-1">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border" style={{ backgroundColor: field.value }}></div>
                        <Input className="pl-9" placeholder="#1F618D" {...field} />
                    </div>
                </FormControl>
                <div className="flex items-center gap-2 flex-wrap">
                  {colorPresets.map(color => (
                    <Button
                      key={color}
                      type="button"
                      variant="outline"
                      className="h-8 w-8 rounded-full p-0"
                      style={{ backgroundColor: color }}
                      onClick={() => form.setValue("primaryColor", color, { shouldValidate: true })}
                    />
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Guardar Cambios</Button>
      </form>
    </Form>
  );
}

function SecuritySettings() {
    const { settings, setSettings } = useSettings();

    const handleRegistrationToggle = (isEnabled: boolean) => {
        setSettings(prev => ({ ...prev, isRegistrationEnabled: isEnabled }));
        toast({
            title: `Registro ${isEnabled ? 'habilitado' : 'deshabilitado'}`,
            description: `La página de registro de nuevos administradores ha sido ${isEnabled ? 'activada' : 'desactivada'}.`,
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Registro Público</CardTitle>
                    <CardDescription>
                        Permite o deniega la creación de nuevas cuentas de administrador desde la página de registro. Se recomienda deshabilitar esta opción después de crear las cuentas iniciales.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="registration-switch"
                            checked={settings.isRegistrationEnabled}
                            onCheckedChange={handleRegistrationToggle}
                        />
                        <Label htmlFor="registration-switch">
                            {settings.isRegistrationEnabled ? 'Registro Habilitado' : 'Registro Deshabilitado'}
                        </Label>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function IntegrationSettings() {
    const { settings, setSettings } = useSettings();

    const handleConnectDrive = () => {
        // In a real app, this would redirect to Google's OAuth screen
        setSettings(prev => ({ ...prev, isDriveConnected: true }));
        toast({
            title: "Google Drive Conectado",
            description: "Su cuenta ha sido conectada exitosamente.",
        });
    };

    const handleDisconnectDrive = () => {
        setSettings(prev => ({ ...prev, isDriveConnected: false }));
        toast({
            variant: "destructive",
            title: "Google Drive Desconectado",
            description: "Su cuenta ha sido desconectada.",
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Google Drive</CardTitle>
                <CardDescription>
                    Conecte su cuenta de Google Drive para guardar automáticamente los documentos adjuntos (informes, permisos, etc.) de forma segura.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {settings.isDriveConnected ? (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium text-green-600">Conectado a Google Drive</p>
                        <Button variant="destructive" size="sm" onClick={handleDisconnectDrive}>Desconectar</Button>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        La integración con Google Drive no está activa.
                    </p>
                )}
            </CardContent>
            {!settings.isDriveConnected && (
                <CardFooter>
                    <Button onClick={handleConnectDrive}>
                        Conectar mi cuenta de Google Drive
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}

function UserManagement({ users, onEdit, onDelete, onAdd }: { users: UserProfile[], onEdit: (user: UserProfile) => void; onDelete: (user: UserProfile) => void; onAdd: () => void; }) {
  return (
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <CardTitle>Usuarios</CardTitle>
                <CardDescription>
                    Añada, edite o elimine usuarios administradores del sistema y gestione sus roles.
                </CardDescription>
            </div>
             <Button onClick={onAdd} className="shrink-0 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Añadir Administrador
            </Button>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {users.map(user => (
                <Card key={user.id}>
                    <CardHeader className="flex items-start sm:items-center justify-between gap-2 p-4 flex-col sm:flex-row">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                                <UserIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-base truncate">{user.name}</CardTitle>
                                <CardDescription className="truncate">{user.email}</CardDescription>
                                <Badge variant="secondary" className="mt-2 sm:hidden">{user.role}</Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center ml-auto sm:ml-0">
                             <Badge variant="secondary" className="hidden sm:inline-flex">{user.role}</Badge>
                            <ResponsiveDropdownMenu>
                                <ResponsiveDropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </ResponsiveDropdownMenuTrigger>
                                <ResponsiveDropdownMenuContent>
                                <ResponsiveDropdownMenuItem onSelect={() => onEdit(user)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar Rol
                                </ResponsiveDropdownMenuItem>
                                <ResponsiveDropdownMenuItem
                                    className="text-destructive"
                                    onSelect={() => onDelete(user)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </ResponsiveDropdownMenuItem>
                                </ResponsiveDropdownMenuContent>
                            </ResponsiveDropdownMenu>
                        </div>
                    </CardHeader>
                </Card>
                ))}
            </div>
        </CardContent>
      </Card>
  );
}

function ParameterManager({
  title,
  description,
  placeholder,
  items,
  onAdd,
  onDelete,
}: {
  title: string;
  description: string;
  placeholder: string;
  items: string[];
  onAdd: (item: string) => void;
  onDelete: (item: string) => void;
}) {
  const [newItem, setNewItem] = useState('');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleAddItem = () => {
    onAdd(newItem);
    setNewItem('');
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setItemToDelete(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            className="flex-grow"
          />
          <Button onClick={handleAddItem} disabled={!newItem.trim()} className="w-full sm:w-auto shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Añadir
          </Button>
        </div>
        
        <div className="border rounded-md">
            <h4 className="text-sm font-medium text-muted-foreground px-4 py-3">Tipos Actuales</h4>
            <div className="divide-y">
                {items.length > 0 ? (
                    items.map(item => (
                        <div key={item} className="flex items-center justify-between p-4 py-3">
                            <span className="text-sm">{item}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setItemToDelete(item)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Eliminar {item}</span>
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground italic text-center p-6">No hay tipos definidos.</p>
                )}
            </div>
        </div>
      </CardContent>
      {itemToDelete && (
        <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará el tipo <span className="font-semibold">{itemToDelete}</span> de la lista.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}

const ALL_TABS = [
  { id: 'users', label: 'Usuarios', icon: Users, adminOnly: true },
  { id: 'permissions', label: 'Tipos de permisos', icon: FileCheck, adminOnly: false },
  { id: 'incidents', label: 'Tipos de incidentes', icon: AlertTriangle, adminOnly: false },
  { id: 'diagnosis', label: 'Diagnóstico', icon: Stethoscope, adminOnly: false },
  { id: 'dropout', label: 'Deserción', icon: UserMinus, adminOnly: false },
  { id: 'personalization', label: 'Personalización', icon: Palette, adminOnly: true },
  { id: 'integrations', label: 'Integraciones', icon: Share2, adminOnly: true },
  { id: 'security', label: 'Seguridad', icon: Shield, adminOnly: true },
];

export default function SettingsPage() {
  const { 
      currentUserProfile,
      profiles, addProfile, editProfile, deleteProfile,
      permissionTypes, addPermissionType, deletePermissionType,
      incidentTypes, addIncidentType, deleteIncidentType,
      neeDiagnosisTypes, addNeeDiagnosisType, deleteNeeDiagnosisType,
      dropoutReasons, addDropoutReason, deleteDropoutReason
  } = useAppContext();

  const isSuperAdmin = currentUserProfile?.role === 'Admin';

  const TABS = useMemo(() => {
    return ALL_TABS.filter(tab => !tab.adminOnly || isSuperAdmin);
  }, [isSuperAdmin]);

  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const isMobile = useIsMobile();

  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | undefined>(undefined);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  const adminRoles = useMemo(() => ['Admin', 'Director', 'Subdirector', 'Coordinador'], []);
  const adminProfiles = useMemo(() => profiles.filter(p => adminRoles.includes(p.role)), [profiles, adminRoles]);

  const handleAddUser = () => {
    setSelectedUser(undefined);
    setIsUserFormOpen(true);
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsUserFormOpen(true);
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
        await deleteProfile(userToDelete.id);
        toast({
            title: "Usuario Eliminado",
            description: `El usuario ${userToDelete.name} ha sido eliminado.`,
        });
        setUserToDelete(null);
    }
  };

  const handleSaveUser = async (userData: UserProfileFormValues) => {
    try {
        if (userData.id) {
            await editProfile(userData.id, userData);
            toast({ title: "Usuario Actualizado", description: "Los datos del usuario han sido actualizados." });
        } else {
            await addProfile(userData);
            toast({ title: "Usuario Creado", description: "El nuevo usuario administrativo ha sido añadido." });
        }
        setIsUserFormOpen(false);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error al guardar",
            description: error instanceof Error ? error.message : "No se pudo guardar el usuario.",
        });
    }
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return isSuperAdmin ? <UserManagement users={adminProfiles} onEdit={handleEditUser} onDelete={(user) => setUserToDelete(user)} onAdd={handleAddUser} /> : null;
      case 'permissions':
        return (
            <ParameterManager
                title="Tipos de Permiso"
                description="Gestione las categorías para los permisos de los estudiantes."
                placeholder="p. ej. Actividad Deportiva"
                items={permissionTypes}
                onAdd={addPermissionType}
                onDelete={deletePermissionType}
            />
        );
      case 'incidents':
        return (
            <ParameterManager
                title="Tipos de Incidente"
                description="Gestione las categorías para los incidentes de los estudiantes."
                placeholder="p. ej. Conflicto con compañero"
                items={incidentTypes}
                onAdd={addIncidentType}
                onDelete={deleteIncidentType}
            />
        );
      case 'diagnosis':
        return (
            <ParameterManager
                title="Tipos de Diagnóstico"
                description="Gestione los tipos de diagnóstico para estudiantes con NEE."
                placeholder="p. ej. TDAH"
                items={neeDiagnosisTypes}
                onAdd={addNeeDiagnosisType}
                onDelete={deleteNeeDiagnosisType}
            />
        );
      case 'dropout':
        return (
             <ParameterManager
                title="Razones de Deserción"
                description="Gestione los motivos de deserción estudiantil."
                placeholder="p. ej. Problemas de Salud"
                items={dropoutReasons}
                onAdd={addDropoutReason}
                onDelete={deleteDropoutReason}
            />
        );
      case 'personalization':
        return isSuperAdmin ? (
            <Card>
                <CardHeader>
                    <CardTitle>Personalización</CardTitle>
                    <CardDescription>Estos ajustes se aplicarán en toda la aplicación.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CustomizationForm />
                </CardContent>
            </Card>
        ) : null;
      case 'integrations':
        return isSuperAdmin ? <IntegrationSettings /> : null;
      case 'security':
        return isSuperAdmin ? <SecuritySettings /> : null;
      default:
        return null;
    }
  };
  
  return (
    <>
      <PageHeader
        title="Ajustes"
      />
      
      <div className="mb-6">
        {isMobile ? (
           <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una categoría" />
              </SelectTrigger>
              <SelectContent>
                {TABS.map(tab => (
                  <SelectItem key={tab.id} value={tab.id}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap h-auto">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="whitespace-nowrap">
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>
      
      {renderContent()}

      <UserForm
        isOpen={isUserFormOpen}
        onOpenChange={setIsUserFormOpen}
        onSave={handleSaveUser}
        user={selectedUser}
      />

      {userToDelete && (
        <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará permanentemente al usuario <span className="font-semibold">{userToDelete.name}</span> del sistema de autenticación. No se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
