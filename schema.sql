-- Habilitar la extensión para generar IDs únicos (UUIDs)
create extension if not exists "uuid-ossp" with schema "extensions";

-- 1. Tabla de Grados (Ej: 1er Grado, 2do Grado)
-- Almacena los niveles educativos principales.
create table "grades" (
  "id" uuid primary key default uuid_generate_v4(),
  "name" text not null,
  "created_at" timestamp with time zone not null default now()
);

-- 2. Tabla de Secciones (Ej: A, B, C)
-- Cada sección pertenece a un grado específico.
create table "sections" (
  "id" uuid primary key default uuid_generate_v4(),
  "name" text not null,
  "grade_id" uuid not null references "grades"(id) on delete cascade,
  "created_at" timestamp with time zone not null default now()
);

-- 3. Políticas de Acceso Básico (RLS)
-- Esto permite que la aplicación pueda leer la lista de grados y secciones.
alter table "grades" enable row level security;
alter table "sections" enable row level security;

create policy "Allow public read access to grades" on "grades"
  for select using (true);

create policy "Allow public read access to sections" on "sections"
  for select using (true);

-- Permisos para la clave anónima (anon key)
-- Otorga el permiso de solo lectura que definimos en las políticas anteriores.
grant select on table "grades" to "anon", "authenticated";
grant select on table "sections" to "anon", "authenticated";

-- Otorgar permisos de escritura para la clave anónima (anon key)
-- Esto permitirá crear, actualizar y eliminar registros desde la aplicación.
grant insert, update, delete on table "grades" to "anon", "authenticated";
grant insert, update, delete on table "sections" to "anon", "authenticated";

-- Crear políticas de acceso para escritura
-- Estas políticas permiten a cualquier usuario realizar estas acciones.
-- Para una aplicación en producción, se restringiría a roles específicos.
create policy "Allow full access for anon users on grades" on "grades"
  for all using (true) with check (true);

create policy "Allow full access for anon users on sections" on "sections"
  for all using (true) with check (true);

-- 4. Tabla de Estudiantes
-- Almacena la información de cada estudiante.
-- Se relaciona con un grado y una sección específicos.
create table "students" (
  "id" uuid primary key default uuid_generate_v4(),
  "first_name" text not null,
  "last_name" text not null,
  "dni" varchar(8) not null unique,
  "grade_id" uuid not null references "grades"(id) on delete restrict,
  "section_id" uuid not null references "sections"(id) on delete restrict,
  "created_at" timestamp with time zone not null default now()
);

-- 5. Políticas de Acceso para Estudiantes
alter table "students" enable row level security;

-- Permite a cualquier usuario leer la lista de estudiantes.
create policy "Allow public read access to students" on "students"
  for select using (true);

-- Permite a cualquier usuario crear, actualizar y eliminar estudiantes.
create policy "Allow full access for anon users on students" on "students"
  for all using (true) with check (true);

-- Otorgar permisos a la clave anónima (anon key)
grant select, insert, update, delete on table "students" to "anon", "authenticated";
