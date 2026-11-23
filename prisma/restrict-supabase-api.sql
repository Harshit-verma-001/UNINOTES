BEGIN;

-- UNINOTES accesses these tables through its server-side PostgreSQL connection.
REVOKE ALL PRIVILEGES ON TABLE
  public."User", public."Department", public."Note",
  public."Rating", public."Comment", public."Download"
  FROM PUBLIC, anon, authenticated;

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Department" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Note" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Rating" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Download" ENABLE ROW LEVEL SECURITY;

COMMIT;
