-- CustomerHub — esquema PostgreSQL
-- Un tenant = una organización. Cada servicio de API usa su schema.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS profile;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS crm;
CREATE SCHEMA IF NOT EXISTS ops;
CREATE SCHEMA IF NOT EXISTS growth;

CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TYPE identity.app_role AS ENUM ('owner', 'admin', 'analista');
CREATE TYPE identity.onboarding_step AS ENUM ('perfil', 'pago', 'listo');
CREATE TYPE identity.member_status AS ENUM ('activo', 'invitado');

CREATE TYPE billing.subscription_status AS ENUM ('trial', 'activo', 'impago', 'cancelado');
CREATE TYPE billing.plan_id AS ENUM ('trial', 'inicial', 'crecimiento');

CREATE TYPE crm.enrollment_status AS ENUM ('en_voz', 'contestada', 'fallback_whatsapp', 'cerrada');

CREATE TYPE ops.disposition AS ENUM ('contestada', 'no_contestada', 'ocupado', 'fallo', 'buzon');
CREATE TYPE ops.channel AS ENUM ('voice', 'whatsapp', 'sms', 'email');
CREATE TYPE ops.message_status AS ENUM ('en_cola', 'enviado', 'fallido');

-- ---------------------------------------------------------------------------
-- Identidad
-- ---------------------------------------------------------------------------

CREATE TABLE identity.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  onboarding_step identity.onboarding_step NOT NULL DEFAULT 'perfil',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON identity.organizations
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE identity.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON identity.users
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE identity.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES identity.organizations (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
  role identity.app_role NOT NULL,
  status identity.member_status NOT NULL DEFAULT 'invitado',
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE UNIQUE INDEX members_one_owner_per_org
  ON identity.members (organization_id)
  WHERE role = 'owner' AND status = 'activo';

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON identity.members
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE identity.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES identity.members (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sessions_member_id_idx ON identity.sessions (member_id);
CREATE INDEX sessions_expires_at_idx ON identity.sessions (expires_at);

-- ---------------------------------------------------------------------------
-- Perfilado
-- ---------------------------------------------------------------------------

CREATE TABLE profile.business_profiles (
  organization_id uuid PRIMARY KEY REFERENCES identity.organizations (id) ON DELETE CASCADE,
  url text NOT NULL,
  trade_name text NOT NULL,
  industry text NOT NULL,
  offer text NOT NULL,
  products text NOT NULL,
  tone text NOT NULL,
  confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER business_profiles_updated_at
  BEFORE UPDATE ON profile.business_profiles
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE profile.drafts (
  organization_id uuid PRIMARY KEY REFERENCES identity.organizations (id) ON DELETE CASCADE,
  url text NOT NULL,
  trade_name text,
  industry text,
  offer text,
  products text,
  tone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER drafts_updated_at
  BEFORE UPDATE ON profile.drafts
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- ---------------------------------------------------------------------------
-- Facturación
-- ---------------------------------------------------------------------------

CREATE TABLE billing.subscriptions (
  organization_id uuid PRIMARY KEY REFERENCES identity.organizations (id) ON DELETE CASCADE,
  status billing.subscription_status NOT NULL,
  plan_id billing.plan_id NOT NULL,
  trial_ends_at timestamptz,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trial_has_end CHECK (
    status <> 'trial' OR trial_ends_at IS NOT NULL
  )
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON billing.subscriptions
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- ---------------------------------------------------------------------------
-- CRM: contactos, campañas, inscripciones
-- ---------------------------------------------------------------------------

CREATE TABLE crm.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES identity.organizations (id) ON DELETE CASCADE,
  nombre text NOT NULL,
  cedula text NOT NULL,
  edad smallint CHECK (edad IS NULL OR edad BETWEEN 0 AND 120),
  genero text NOT NULL DEFAULT '',
  metodo_pago text NOT NULL DEFAULT '',
  ciudad text NOT NULL DEFAULT '',
  telefono text NOT NULL,
  email citext NOT NULL DEFAULT '',
  negocio text NOT NULL,
  whatsapp_consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, cedula)
);

CREATE INDEX contacts_org_negocio_idx ON crm.contacts (organization_id, negocio);
CREATE INDEX contacts_org_ciudad_idx ON crm.contacts (organization_id, ciudad);
CREATE INDEX contacts_org_telefono_idx ON crm.contacts (organization_id, telefono);

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON crm.contacts
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE crm.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES identity.organizations (id) ON DELETE CASCADE,
  nombre text NOT NULL,
  negocio text NOT NULL,
  objetivo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX campaigns_org_negocio_idx ON crm.campaigns (organization_id, negocio);

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON crm.campaigns
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE crm.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES identity.organizations (id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES crm.contacts (id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES crm.campaigns (id) ON DELETE CASCADE,
  status crm.enrollment_status NOT NULL DEFAULT 'en_voz',
  converted boolean NOT NULL DEFAULT false,
  products_sold integer NOT NULL DEFAULT 0 CHECK (products_sold >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, contact_id)
);

CREATE INDEX enrollments_org_status_idx ON crm.enrollments (organization_id, status);

CREATE TRIGGER enrollments_updated_at
  BEFORE UPDATE ON crm.enrollments
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- ---------------------------------------------------------------------------
-- Operación: voz (máx. 3 intentos), un WhatsApp de fallback, grabaciones, kill switches
-- ---------------------------------------------------------------------------

CREATE TABLE ops.channel_controls (
  organization_id uuid NOT NULL REFERENCES identity.organizations (id) ON DELETE CASCADE,
  channel ops.channel NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  updated_by_member_id uuid REFERENCES identity.members (id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, channel),
  CONSTRAINT controls_voice_or_whatsapp CHECK (channel IN ('voice', 'whatsapp'))
);

CREATE TABLE ops.voice_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES identity.organizations (id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES crm.enrollments (id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES crm.contacts (id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES crm.campaigns (id) ON DELETE CASCADE,
  attempt_number smallint NOT NULL CHECK (attempt_number BETWEEN 1 AND 3),
  disposition ops.disposition NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, attempt_number)
);

CREATE INDEX voice_attempts_org_at_idx ON ops.voice_attempts (organization_id, attempted_at DESC);
CREATE INDEX voice_attempts_contact_idx ON ops.voice_attempts (contact_id);

COMMENT ON TABLE ops.voice_attempts IS
  'Hasta tres intentos de voz. No contesta, ocupado, fallo o buzón cuentan como fallido. Contestada cierra el ciclo.';

CREATE TABLE ops.outbound_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES identity.organizations (id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES crm.enrollments (id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES crm.contacts (id) ON DELETE CASCADE,
  channel ops.channel NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email')),
  status ops.message_status NOT NULL DEFAULT 'en_cola',
  body text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Un solo WhatsApp por inscripción (regla de negocio del fallback).
CREATE UNIQUE INDEX one_whatsapp_per_enrollment
  ON ops.outbound_messages (enrollment_id)
  WHERE channel = 'whatsapp';

COMMENT ON INDEX ops.one_whatsapp_per_enrollment IS
  'Tras tres fallos de voz se envía un único WhatsApp, si hay consentimiento y el bot está encendido.';

CREATE TABLE ops.recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES identity.organizations (id) ON DELETE CASCADE,
  attempt_id uuid NOT NULL UNIQUE REFERENCES ops.voice_attempts (id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES crm.contacts (id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES crm.campaigns (id) ON DELETE CASCADE,
  duration_sec integer NOT NULL CHECK (duration_sec >= 0),
  storage_key text,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX recordings_org_at_idx ON ops.recordings (organization_id, recorded_at DESC);

-- ---------------------------------------------------------------------------
-- Leads comerciales (sitio público, sin tenant)
-- ---------------------------------------------------------------------------

CREATE TABLE growth.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email citext NOT NULL,
  empresa text NOT NULL,
  mensaje text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX leads_created_at_idx ON growth.leads (created_at DESC);
