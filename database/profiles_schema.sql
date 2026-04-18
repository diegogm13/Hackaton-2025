-- ============================================================
-- FitAI – Supabase/PostgreSQL Schema
-- Tabla: profiles  (vinculada a auth.users)
-- ============================================================

-- Extensión UUID (ya viene habilitada en Supabase por defecto)
create extension if not exists "uuid-ossp";

-- ============================================================
-- Tabla principal de perfiles
-- ============================================================
create table public.profiles (
  -- PK vinculada al sistema de auth de Supabase
  id           uuid references auth.users(id) on delete cascade primary key,

  -- Datos de cuenta (replicados desde auth.users para consultas rápidas)
  nombre       text        not null default '',
  email        text        not null default '',

  -- ── Pantalla: Personalizacion ──────────────────────────────
  -- 0: Plan de Ejercicio | 1: Plan Nutricional | 2: Plan Completo
  plan         smallint    not null default 2
                           check (plan between 0 and 2),

  -- ── Pantalla: DatosEstadisticos ───────────────────────────
  altura       numeric(5,1),          -- cm  (ej. 175.0)
  peso         numeric(5,2),          -- kg  (ej. 72.50)
  masa_muscular numeric(5,2),         -- %   (ej. 38.00)
  grasa_corporal numeric(5,2),        -- %   (ej. 22.00)
  etnia        text,
  -- Opciones: 'Latina' | 'Caucásica' | 'Asiática' | 'Afrodescendiente' | 'Otra'

  -- ── Pantalla: DatosEstiloVida ─────────────────────────────
  -- 0: Nunca | 1: 1-2x/sem | 2: 3-4x/sem | 3: 5+/sem
  rutina_ejercicio    smallint default 1
                      check (rutina_ejercicio between 0 and 3),

  -- 0: 30 min | 1: 1 hora | 2: 2 horas | 3: Flexible
  disponibilidad_diaria smallint default 1
                        check (disponibilidad_diaria between 0 and 3),

  -- 0: Omnívoro | 1: Vegano | 2: Vegetariano | 3: Keto
  dieta_preferida     smallint default 0
                      check (dieta_preferida between 0 and 3),

  -- Array de hábitos booleanos [alcohol, tabaco, suplementos]
  -- Ejemplo: [true, false, true]
  habitos_consumo     jsonb    not null default '[]'::jsonb,

  alergias            text     default '',

  -- ── Pantalla: DatosSalud ──────────────────────────────────
  -- Array de respuestas a preguntas de salud [bool x4]
  -- Índices: 0=enf.crónicas, 1=cond.psicológicas, 2=discapacidad, 3=período reproductivo
  condiciones_salud   jsonb    not null default '[]'::jsonb,

  detalle_condiciones text     default '',

  -- ── Metadatos ─────────────────────────────────────────────
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.profiles enable row level security;

create policy "Cada usuario ve solo su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Cada usuario actualiza solo su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- Trigger: auto-crear perfil al registrar usuario en auth.users
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Trigger: auto-actualizar updated_at en cada UPDATE
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Índices útiles
-- ============================================================
create index profiles_email_idx on public.profiles (email);
create index profiles_plan_idx  on public.profiles (plan);
