-- =====================================================================
-- SokoCircle reference / mock data  -- REAL figures with sources
-- Generated 6 Oct 2026. Safe to re-run (idempotent upserts).
--
-- Every row carries a source_id -> public.data_sources, so the app can show
-- "Source: <publisher>, <year>". Reliability is graded:
--   official | official-secondary | academic | secondary | media | blog
--
-- IMPORTANT
--  * Nothing here is invented. Where sources disagree, the row's note says so.
--  * KNBS MSME figures are from 2016 (latest comprehensive national count).
--  * County codes (001-047) are from background knowledge, not a fetched
--    dataset: verify against the KNBS county list before relying on them.
--  * Do NOT present these as live measurements; always show the "as of" year.
-- =====================================================================

create table if not exists public.data_sources (
  id text primary key, title text not null, publisher text, url text,
  year int, reliability text not null
);
create table if not exists public.counties (
  code text primary key, name text unique not null,
  population_2019 int not null, population_2023_proj int,
  source_id text references public.data_sources(id)
);
create table if not exists public.msme_stats (
  key text primary key, label text not null, value numeric not null,
  unit text not null, year int, source_id text references public.data_sources(id), note text
);
create table if not exists public.area_population (
  id serial primary key, county text not null, sub_county text, area text not null,
  population int not null, year int not null,
  source_id text references public.data_sources(id), note text,
  unique (county, area, year)
);
create table if not exists public.market_hubs (
  name text primary key, county text not null, category text not null, hub_type text not null,
  reported_stat text, description text, source_ids text[] not null default '{}'
);
create table if not exists public.sacco_reference (
  name text primary key, fiscal_year int not null,
  total_assets_kes_bn numeric, deposits_kes_bn numeric, gross_loans_kes_bn numeric, income_kes_bn numeric,
  common_bond_note text, source_id text references public.data_sources(id)
);

alter table public.data_sources enable row level security;
alter table public.counties enable row level security;
alter table public.msme_stats enable row level security;
alter table public.area_population enable row level security;
alter table public.market_hubs enable row level security;
alter table public.sacco_reference enable row level security;
do $$ declare t text; begin
  foreach t in array array['data_sources','counties','msme_stats','area_population','market_hubs','sacco_reference'] loop
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname='Public read '||t) then
      execute format('create policy %I on public.%I for select using (true)', 'Public read '||t, t);
    end if;
  end loop;
end $$;

-- ---------- data_sources ----------
insert into public.data_sources (id,title,publisher,url,year,reliability) values
  ('knbs_msme_2016','2016 MSME Survey (Basic Report & Highlights)','KNBS','https://www.knbs.or.ke/reports/kenya-micro-small-and-medium-enterprises-basic-report-2016/',2016,'official'),
  ('knbs_msme_highlights_pdf','2016 MSME Survey Highlights of Basic Report (PDF)','KNBS','https://www.knbs.or.ke/wp-content/uploads/2023/09/2016-Micro-Small-And-Medium-Enterprises-Survey-Highlights-Of-Basic-Report.pdf',2016,'official'),
  ('kenada_msme_2016','MSME Survey 2016 microdata catalog (KeNADA)','KNBS','https://statistics.knbs.or.ke/nada/index.php/catalog/69',2016,'official'),
  ('draft_msme_policy_2025','Draft MSME Policy 2025 (cites KNBS 2016)','Ministry of Co-operatives & MSMEs','https://msme.go.ke/sites/default/files/2025-03/Draft%20MSME%20Policy%202025.pdf',2025,'official'),
  ('kippra_msme','KIPPRA paper on MSMEs (cites KNBS 2016)','KIPPRA','https://repository.kippra.or.ke/server/api/core/bitstreams/36cc8daf-5a13-459f-b4d1-538d08f2ddab/content',NULL,'official-secondary'),
  ('knbs_census_2019','2019 Kenya Population & Housing Census, Vol I (by county)','KNBS','https://www.knbs.or.ke/wp-content/uploads/2023/09/2019-Kenya-population-and-Housing-Census-Volume-1-Population-By-County-And-Sub-County.pdf',2019,'official'),
  ('wiki_county_pop','List of counties of Kenya by population (cites KNBS & citypopulation.de)','Wikipedia','https://en.wikipedia.org/wiki/List_of_counties_of_Kenya_by_population',2024,'secondary'),
  ('nairobilaw_pop','County population 2019 vs 2023 projection table','Nairobi Law Monthly','https://nairobilawmonthly.com/?p=56910',2023,'secondary'),
  ('wiki_kayole','Kayole (cites KNBS 2019 Census Vol II)','Wikipedia','https://en.wikipedia.org/wiki/Kayole',2019,'secondary'),
  ('wiki_komarock','Komarock (cites KNBS 2019 Census Vol II p.248)','Wikipedia','https://en.wikipedia.org/wiki/Komarock',2019,'secondary'),
  ('finaccess_2024','2024 FinAccess Household Survey','CBK / KNBS / FSD Kenya','https://www.knbs.or.ke/reports/2024-finacess-household-survey-report/',2024,'official'),
  ('afi_finaccess_2024','Financial inclusion at record high (FinAccess 2024 summary)','AFI','https://afi-global.org/?p=94724',2024,'secondary'),
  ('nielsen_businessdaily','Retailers shift battle for market share (Nielsen data)','Business Daily','https://www.businessdailyafrica.com/datahub/Retailers-shift-battle-for-market-share/3815418-5208258-v0sr4o/index.html',2019,'media'),
  ('euromonitor_gencat','Kenya: buying and selling (cites Euromonitor)','Catalan trade portal','https://tradeportal.accio.gencat.cat/ca/mercats-potencials/kenya/distribucio',2016,'secondary'),
  ('allafrica_mitumba','Kenya emerges Africa''s largest importer of second-hand clothes (MIT OEC data)','AllAfrica / Nation','https://allafrica.com/stories/202504010615.html',2025,'media'),
  ('afp_malaymail_gikomba','Kenyan designers turn discarded clothes into runway fashion (AFP)','Malay Mail / AFP','https://www.malaymail.com/news/showbiz/2025/10/14/kenyan-designers-turn-discarded-clothes-into-runway-fashion-at-gikomba-market/194444',2025,'media'),
  ('eastleighvoice_gikomba','History of Gikomba market','Eastleigh Voice','https://eastleighvoice.co.ke/maureen-kinyanjui/54316/the-history-of-nairobi-s-gikomba-market-and-its-perennial-mysterious-fires',2023,'media'),
  ('nation_gikomba','Gikomba: End of an era?','Nation','https://nation.africa/kenya/counties/nairobi/gikomba-end-of-an-era--5410460',2026,'media'),
  ('keoffers_gikomba','Best mitumba markets in Nairobi (Block D note)','KE Offers blog','https://blog.keoffers.co.ke/best-mitumba-markets-in-nairobi-vs-buying-online/',2026,'blog'),
  ('grips_metalwork','Study of a metalworking cluster in Nairobi (Kamukunji/Kariobangi)','GRIPS / IPAR','https://grips.repo.nii.ac.jp/record/1328/files/SBE%20Kariobangi%202011.pdf',2011,'academic'),
  ('ku_kamukunji','Metallic artisans at Kamukunji enterprise cluster (thesis)','Kenyatta University','https://ir-library.ku.ac.ke/bitstream/handle/123456789/23311/An%20Assessment%20of%20Factors%20Influencing.pdf?sequence=1',NULL,'academic'),
  ('huduma_wakulima','Wakulima Market (Marikiti) profile','Huduma Global','https://hudumaglobal.com/blog/wakulima-market-marikiti-nairobi-fresh-produce',2026,'blog'),
  ('huduma_kongowea','Kongowea Market profile','Huduma Global','https://hudumaglobal.com/blog/kongowea-market-mombasa-fresh-produce-trade-hub',2026,'blog'),
  ('kenya_trade_portal','Wholesale & retail markets register','Kenya Trade Portal (Govt)','https://kenyatradeportal.go.ke/wholesale-retail-markets',NULL,'official'),
  ('sasra_2025_saccoreview','Top 10 largest SACCOs (SASRA Supervision Report 2025)','SaccoReview','https://saccoreview.co.ke/top-10-largest-saccos-by-assets-ranked-by-sasra/',2025,'media'),
  ('sasra_2025_uasingishu','Top 20 DT-SACCOs by total assets (2025 report)','Uasin Gishu News','https://www.uasingishunews.co.ke/top-20-leading-kenyan-deposit-taking-saccos-by-total-assets/',2025,'media'),
  ('sasra_2025_money254','Kenya''s richest SACCOs (SASRA 2025 data)','Money254','https://www.money254.co.ke/post/kenyas-richest-saccos-by-their-assets-2026-news',2026,'media'),
  ('sasra_2026_licences','SASRA licenses 176 DT-SACCOs for 2026 (Gazette 28 Jan 2026)','Business Today','https://businesstoday.co.ke/?p=148671',2026,'media'),
  ('sasra_2024_biznakenya','SACCO sector 2024 (SASRA 2024 report)','Biznakenya','https://biznakenya.com/wealthiest-saccos-in-kenya-by-assets-and-deposits/',2024,'media'),
  ('sasra_register','SASRA official register of licensed SACCOs','SASRA','https://sasra.go.ke',2026,'official'),
  ('kebs_marks','KEBS marks of quality (S-Mark / D-Mark)','KEBS','https://kebs.org/marks-of-quality/',NULL,'official'),
  ('kebs_faq_qa','KEBS Quality Assurance FAQs (permit verification by SMS)','KEBS','https://kebs.org/wp-content/uploads/2024/11/FAQs-Quality-Assurance.pdf',2024,'official')
on conflict (id) do update set title=excluded.title, publisher=excluded.publisher, url=excluded.url, year=excluded.year, reliability=excluded.reliability;

-- ---------- counties ----------
insert into public.counties (code,name,population_2019,population_2023_proj,source_id) values
  ('001','Mombasa',1208333,1311860,'knbs_census_2019'),
  ('002','Kwale',866820,944464,'knbs_census_2019'),
  ('003','Kilifi',1453787,1577335,'knbs_census_2019'),
  ('004','Tana River',315943,352549,'knbs_census_2019'),
  ('005','Lamu',143920,167332,'knbs_census_2019'),
  ('006','Taita-Taveta',340671,363990,'knbs_census_2019'),
  ('007','Garissa',841353,927031,'knbs_census_2019'),
  ('008','Wajir',781263,870636,'knbs_census_2019'),
  ('009','Mandera',867457,959236,'knbs_census_2019'),
  ('010','Marsabit',459785,515292,'knbs_census_2019'),
  ('011','Isiolo',268002,315937,'knbs_census_2019'),
  ('012','Meru',1545714,1625982,'knbs_census_2019'),
  ('013','Tharaka-Nithi',393177,416383,'knbs_census_2019'),
  ('014','Embu',608599,648425,'knbs_census_2019'),
  ('015','Kitui',1136187,1229790,'knbs_census_2019'),
  ('016','Machakos',1421932,1487758,'knbs_census_2019'),
  ('017','Makueni',987653,1042300,'knbs_census_2019'),
  ('018','Nyandarua',638289,695531,'knbs_census_2019'),
  ('019','Nyeri',759164,835408,'knbs_census_2019'),
  ('020','Kirinyaga',610411,653112,'knbs_census_2019'),
  ('021','Murang''a',1056640,1112288,'knbs_census_2019'),
  ('022','Kiambu',2417735,2652880,'knbs_census_2019'),
  ('023','Turkana',926976,1022773,'knbs_census_2019'),
  ('024','West Pokot',621241,676326,'knbs_census_2019'),
  ('025','Samburu',310327,348298,'knbs_census_2019'),
  ('026','Trans-Nzoia',990341,1069039,'knbs_census_2019'),
  ('027','Uasin Gishu',1163186,1257330,'knbs_census_2019'),
  ('028','Elgeyo-Marakwet',454480,495239,'knbs_census_2019'),
  ('029','Nandi',885711,951460,'knbs_census_2019'),
  ('030','Baringo',666763,733333,'knbs_census_2019'),
  ('031','Laikipia',518560,561223,'knbs_census_2019'),
  ('032','Nakuru',2162202,2347849,'knbs_census_2019'),
  ('033','Narok',1157873,1284204,'knbs_census_2019'),
  ('034','Kajiado',1117840,1268261,'knbs_census_2019'),
  ('035','Kericho',901777,954896,'knbs_census_2019'),
  ('036','Bomet',875689,939761,'knbs_census_2019'),
  ('037','Kakamega',1867579,2002435,'knbs_census_2019'),
  ('038','Vihiga',590013,625765,'knbs_census_2019'),
  ('039','Bungoma',1670570,1786973,'knbs_census_2019'),
  ('040','Busia',893681,968763,'knbs_census_2019'),
  ('041','Siaya',993183,1059458,'knbs_census_2019'),
  ('042','Kisumu',1155574,1248474,'knbs_census_2019'),
  ('043','Homa Bay',1131950,1231659,'knbs_census_2019'),
  ('044','Migori',1116436,1234082,'knbs_census_2019'),
  ('045','Kisii',1266860,1344907,'knbs_census_2019'),
  ('046','Nyamira',605576,657502,'knbs_census_2019'),
  ('047','Nairobi',4397073,4750056,'knbs_census_2019')
on conflict (code) do update set name=excluded.name, population_2019=excluded.population_2019, population_2023_proj=excluded.population_2023_proj;

-- ---------- msme_stats ----------
insert into public.msme_stats (key,label,value,unit,year,source_id,note) values
  ('msme_total','Total MSMEs in Kenya',7410000,'establishments',2016,'knbs_msme_2016','Latest comprehensive national count (10 yrs old).'),
  ('msme_licensed','Licensed MSMEs',1560000,'establishments',2016,'knbs_msme_2016','Licensed by county governments.'),
  ('msme_unlicensed','Unlicensed MSMEs',5850000,'establishments',2016,'knbs_msme_2016','Mostly household-level enterprises.'),
  ('msme_employment','Persons engaged in MSMEs',14900000,'persons',2016,'draft_msme_policy_2025','Another section of the same policy says 14.4M; treat as ~14.4-14.9M.'),
  ('msme_gdp_share','MSME contribution to GDP (2015)',33.8,'percent',2015,'draft_msme_policy_2025','Other sources round to ~34%.'),
  ('retail_trade_share_licensed','Wholesale/retail & vehicle repair share of licensed MSMEs',57.1,'percent',2016,'draft_msme_policy_2025',NULL),
  ('retail_trade_share_unlicensed','Wholesale/retail & vehicle repair share of unlicensed MSMEs',62.9,'percent',2016,'draft_msme_policy_2025',NULL),
  ('micro_share_licensed','Micro enterprises share of licensed establishments',92.2,'percent',2016,'draft_msme_policy_2025','Micro = 1-9 employees.'),
  ('unlicensed_employment_share','Unlicensed share of MSME employment',57.8,'percent',2016,'draft_msme_policy_2025',NULL),
  ('unlicensed_gva_share','Unlicensed share of MSME gross value added',10.4,'percent',2016,'draft_msme_policy_2025',NULL),
  ('mse_closed_5yr','Micro/small enterprises that closed within five years',2200000,'establishments',2016,'draft_msme_policy_2025','Policy text also says 46% did not survive year one. A KIPPRA paper cites ~80% closing before year five; sources differ.'),
  ('mse_closed_year1_pct','Share of closures that did not survive first year',46,'percent',2016,'draft_msme_policy_2025',NULL),
  ('survey_sample_licensed','Licensed establishments sampled',50043,'establishments',2016,'knbs_msme_2016','Plus ~14,000 households sampled for unlicensed enterprises.'),
  ('share_nairobi','Share of all MSMEs located in Nairobi',14,'percent',2016,'kippra_msme','KIPPRA paper citing KNBS.'),
  ('share_kakamega','Share of all MSMEs located in Kakamega',4,'percent',2016,'kippra_msme',NULL),
  ('share_kiambu','Share of all MSMEs located in Kiambu',3,'percent',2016,'kippra_msme',NULL),
  ('finaccess_formal_inclusion','Adults with formal financial access',84.8,'percent',2024,'finaccess_2024',NULL),
  ('finaccess_excluded','Adults financially excluded',9.9,'percent',2024,'finaccess_2024',NULL),
  ('finaccess_daily_mobile_money','Adults using mobile money daily',52.6,'percent',2024,'afi_finaccess_2024','23.6% in 2021.'),
  ('fmcg_kiosk_share','Kiosks & groceries share of FMCG spend',66.3,'percent',2019,'nielsen_businessdaily','Year to March 2019; KSh 185.2 billion.'),
  ('fmcg_kiosk_spend_kes_bn','Kiosk & grocery FMCG spend',185.2,'KES billion',2019,'nielsen_businessdaily',NULL),
  ('grocery_retailers_count','Grocery retailers (Euromonitor)',103410,'outlets',2016,'euromonitor_gencat','Sales US$7.4B; >70% of Kenyans shop at kiosks/dukas/roadside stalls.'),
  ('mitumba_import_tonnes','Second-hand clothing imports',197000,'tonnes',2023,'afp_malaymail_gikomba','MIT study via AFP; Kenya = Africa''s largest importer in 2023.'),
  ('mitumba_import_usd_m','Second-hand clothing import value',298,'USD million',2023,'allafrica_mitumba','About KSh 38.5 billion.'),
  ('sacco_sector_assets_kes_tn_2025','Regulated SACCO sector assets',1.21,'KES trillion',2025,'sasra_2025_money254','From KSh 1.08 trillion in 2024.'),
  ('sacco_dt_licensed_2026','Licensed deposit-taking SACCOs (2026)',176,'societies',2026,'sasra_2026_licences','Gazette 28 Jan 2026; 176 more authorised as non-deposit-taking.')
on conflict (key) do update set label=excluded.label, value=excluded.value, unit=excluded.unit, year=excluded.year, source_id=excluded.source_id, note=excluded.note;

-- ---------- area_population ----------
insert into public.area_population (county,sub_county,area,population,year,source_id,note) values
  ('Nairobi','Embakasi Central','Kayole (all wards)',189189,2019,'wiki_kayole','Includes Kayole North 70,461 and Kayole Central+South 118,728.'),
  ('Nairobi','Embakasi Central','Kayole North',70461,2019,'wiki_kayole',NULL),
  ('Nairobi','Embakasi Central','Kayole Central + Kayole South',118728,2019,'wiki_kayole','Source gives the two wards combined.'),
  ('Nairobi','Embakasi Central','Komarock',65145,2019,'wiki_komarock','Area 3.1 km2; density ~21,196/km2.')
on conflict (county,area,year) do update set population=excluded.population, source_id=excluded.source_id, note=excluded.note;

-- ---------- market_hubs ----------
insert into public.market_hubs (name,county,category,hub_type,reported_stat,description,source_ids) values
  ('Gikomba Market','Nairobi','Mitumba & general trade','open-air market','Nairobi County: almost 100,000 people engaged; Nation reports 200,000+ daily visitors; 6,300+ traders affected in a recent clearance','East Africa''s largest second-hand clothing hub (origins 1950s-60s). Fire-prone; a 6-storey market opened 2021 and a Block D complex for 1,700+ traders was unveiled Nov 2025 (blog source).',array['eastleighvoice_gikomba','nation_gikomba','keoffers_gikomba']),
  ('Kamukunji Jua Kali Cluster','Nairobi','Metalwork & hardware','jua kali cluster','About 2,000 enterprises (c.2011 study); 4,500 registered metal artisans (KU thesis)','Informal metalworking cluster producing items like charcoal stoves and buckets; designated for artisans in 1989.',array['grips_metalwork','ku_kamukunji']),
  ('Kariobangi Jua Kali Cluster','Nairobi','Metalwork & hardware','jua kali cluster','About 150 manufacturing enterprises as of 2006 (association estimate)','Smaller Eastlands metalworking cluster that sells to Nairobi and distant towns.',array['grips_metalwork']),
  ('Wakulima Market (Marikiti)','Nairobi','Fresh produce wholesale','wholesale market','Built 1966 for ~300 traders; now far larger','Largest wholesale fresh-produce market in Kenya, in the CBD (Haile Selassie Ave).',array['huduma_wakulima','kenya_trade_portal']),
  ('Kongowea Market','Mombasa','Fresh produce wholesale & retail','wholesale market',NULL,'One of East Africa''s largest wholesale/retail produce markets, in Kongowea, Nyali (mainland Mombasa).',array['huduma_kongowea']),
  ('Kibuye Market','Kisumu','General trade','market',NULL,'Market in Kisumu Central (about -0.0933, 34.7682). No reliable trader count found.',array['kenya_trade_portal'])
on conflict (name) do update set reported_stat=excluded.reported_stat, description=excluded.description, source_ids=excluded.source_ids;

-- ---------- sacco_reference ----------
insert into public.sacco_reference (name,fiscal_year,total_assets_kes_bn,deposits_kes_bn,gross_loans_kes_bn,income_kes_bn,common_bond_note,source_id) values
  ('Mwalimu National DT Sacco',2025,76.31,56.51,56.98,10.75,'Teacher/education-sector based (verify)','sasra_2025_saccoreview'),
  ('Stima DT Sacco',2025,75.27,52.19,57.49,10.82,'Originally power-utility staff; now broader incl. business persons (verify)','sasra_2025_saccoreview'),
  ('Kenya National Police DT Sacco',2025,66.4,37.51,57.23,10.79,'Police-service based (verify)','sasra_2025_uasingishu'),
  ('Harambee DT Sacco',2025,41.29,27.57,35.25,7.22,'Membership has widened to include business community (per bizsasa; verify)','sasra_2025_saccoreview'),
  ('Tower Sacco',2025,34.56,26.21,NULL,NULL,'Unverified','sasra_2025_saccoreview'),
  ('Unaitas Sacco',2025,29.6,15.89,22.61,4.54,'Unverified; another outlet reports assets of 29.80','sasra_2025_saccoreview'),
  ('Kenya Bankers Sacco',2025,10.85,8.12,NULL,NULL,'Banking-sector based (verify)','sasra_2025_money254')
on conflict (name) do update set total_assets_kes_bn=excluded.total_assets_kes_bn, deposits_kes_bn=excluded.deposits_kes_bn, gross_loans_kes_bn=excluded.gross_loans_kes_bn, income_kes_bn=excluded.income_kes_bn, common_bond_note=excluded.common_bond_note, source_id=excluded.source_id;
