-- ============================================================
-- Oasis Detailing Supplies — Supabase database schema + seed data
-- ============================================================
-- HOW TO RUN:
--   Supabase dashboard -> your project -> SQL Editor -> New query
--   -> paste this ENTIRE file -> Run (or press Cmd/Ctrl+Enter).
--
-- SAFE TO RE-RUN: every seed INSERT uses ON CONFLICT DO NOTHING
-- (deterministic UUIDs for content rows, natural keys for packages
-- and site_settings), CREATE TABLE IF NOT EXISTS, and
-- DROP POLICY IF EXISTS before each CREATE POLICY.
-- Nothing is ever TRUNCATEd or deleted.
-- ============================================================

-- gen_random_uuid() lives in pgcrypto (pre-installed on Supabase).
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  note text default '',
  brand text not null,
  initials text default '',
  photo text default '',
  created_at timestamptz default now()
);

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text default '',
  initials text default '',
  photo text default ''
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  photo text default '',
  tag text default '',
  cta_url text default ''
);

create table if not exists packages (
  id text primary key,
  number text,
  name text not null,
  category text not null check (category in ('express','detail','premium')),
  price_car text,
  price_suv text,
  price_truck text,
  coupon text default '',
  includes jsonb default '[]'
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text,
  quote text
);

create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  icon text default ''
);

create table if not exists site_settings (
  id int primary key check (id = 1),
  about_text text default '',
  address text default '',
  hours jsonb default '[]',
  phone1 text default '',
  phone1_href text default '',
  phone2 text default '',
  phone2_href text default '',
  water_text text default '',
  hero_bg text default '',
  water_bg text default '',
  verse_text text default '',
  verse_cite text default '',
  copyright_text text default '',
  address_line text default '',
  logo_url text default ''
);

alter table site_settings add column if not exists theme jsonb default '{}'::jsonb;

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text default '',
  address text default '',
  package_id text default '',
  date text default '',
  time text default '',
  message text default '',
  read boolean default false,
  created_at timestamptz default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text default '',
  topic text default '',
  message text default '',
  read boolean default false,
  created_at timestamptz default now()
);

-- Inbox status workflow (matches migration 004_inbox_status.sql)
alter table appointments add column if not exists status text default 'new';
alter table appointments add column if not exists finished_at timestamptz;
alter table contact_messages add column if not exists status text default 'new';
alter table contact_messages add column if not exists finished_at timestamptz;

-- Indexes
create index if not exists idx_products_brand on products (brand);


-- ============================================================
-- SEED: products (73 rows)
-- ============================================================
insert into products (id,name,note,brand,initials,photo) values
('1ffa9f51-d01c-5da9-8070-ff182e403a77','Dinowax Blue Magic','1 gal','Dinowax','DINO','images/products/Dino Wax/053756619eabce598ef5470c2260cb50_fit.jpg'),
('ffcee836-1cad-52ca-a1a8-5450fa7cb3eb','Dinowax Tire Dressing','1 qt','Dinowax','DINO','images/products/Dino Wax/24a1d569d8ebdeb1928faa19e431ce02_fit.jpg'),
('1776673d-19c7-5173-a708-4dc88ea849be','Dinowax Magic Shine','1 pt','Dinowax','DINO','images/products/Dino Wax/27daf1b417e9dd23413077077a4e860e_fit.jpg'),
('0adb1fe9-0a5e-5baa-939a-f8cf65031227','Dinowax Shampoo','1 qt','Dinowax','DINO','images/products/Dino Wax/391b063352590fa0057fc43bae62d380_fit.jpg'),
('942d4de2-a695-51bc-bb6e-cb9b9110f512','Dinowax Wash & Wax','1 gal','Dinowax','DINO','images/products/Dino Wax/4cc6feb616043986316c5c7d4c2ad557_fit.jpg'),
('0b687b90-9918-5369-86be-9077a184df53','Dinowax ReNuCar Saturday Night','1 pt','Dinowax','DINO','images/products/Dino Wax/51da4ef739e22cf2318ec258f799301e_fit.jpg'),
('1ffa9f51-d01c-5da9-8070-ff182e403a77','Dinowax Blue Magic','1 qt','Dinowax','DINO','images/products/Dino Wax/566421d0d4e888d5469edc8863388e08_fit.jpg'),
('086de445-cb04-51a1-b10c-923debc38e0a','Dinowax Degreaser','1 qt','Dinowax','DINO','images/products/Dino Wax/5a1fe5be2b04aecbbe224e8921248d7e_fit.jpg'),
('942d4de2-a695-51bc-bb6e-cb9b9110f512','Dinowax Wash & Wax','1 qt','Dinowax','DINO','images/products/Dino Wax/5ebe295633c7907914d461facd1b8f14_fit.jpg'),
('374578d9-3f00-5615-9e78-69b782a14288','Dinowax ReNuCar Newport Breeze','1 pt','Dinowax','DINO','images/products/Dino Wax/66909eb06f09c3763d687a1bbbeef57d_fit.jpg'),
('dd5f11ae-7fa0-56dd-a726-dc5632514145','Dinowax Brightener','1 gal','Dinowax','DINO','images/products/Dino Wax/6800aba836492acc9b953218dbc7c990_fit.jpg'),
('5ab354d6-494e-56ba-9554-e4f01663398d','Dinowax Cleaner','1 qt','Dinowax','DINO','images/products/Dino Wax/744480e500047ab63c0197367f370ba4_fit.jpg'),
('086de445-cb04-51a1-b10c-923debc38e0a','Dinowax Degreaser','1 gal','Dinowax','DINO','images/products/Dino Wax/765d4888bbd5214ae349b130b9d53012_fit.jpg'),
('dd5f11ae-7fa0-56dd-a726-dc5632514145','Dinowax Brightener','1 qt','Dinowax','DINO','images/products/Dino Wax/78ec94faa0bb67d81962f12161755cd7_fit.jpg'),
('0a07b4f7-bf6c-58da-a50e-f72c21290b22','Dinowax ReNuCar Bamboo Lime','1 pt','Dinowax','DINO','images/products/Dino Wax/7c246bde8c95d54403d3e7efc2f0d1d2_fit.jpg'),
('ffcee836-1cad-52ca-a1a8-5450fa7cb3eb','Dinowax Tire Dressing','1 gal','Dinowax','DINO','images/products/Dino Wax/8c154d8537f70bbe513a3b642b15bf30_fit.jpg'),
('0adb1fe9-0a5e-5baa-939a-f8cf65031227','Dinowax Shampoo','1 gal','Dinowax','DINO','images/products/Dino Wax/ac84a39484d9779cad28b04fe7d80f4a_fit.jpg'),
('89e0c754-6205-58fb-8829-cd7b67952879','Dinowax Cleaning','1 gal','Dinowax','DINO','images/products/Dino Wax/af15574cfb55fba8bf226a5c0b0c0bbd_fit.jpg'),
('608da298-cc0a-58cf-a6b9-5bfc15a26a5a','Dinowax ReNuCar Leather Glove','1 pt','Dinowax','DINO','images/products/Dino Wax/cc1cebe3b224b79d6e2a5cca62b444e3_fit.jpg'),
('8330da89-7db6-5d24-802a-8d85d7adf707','Finish Renu FR-64 Leather Cleaner','','Finish Renu','FINI','images/products/Finish Renu/075c58569bacb4c755399cfd76b530c8_fit.jpg'),
('b420df13-61cd-5821-8ac8-9b6e422e30b2','Finish Renu FR-43 High Gloss','','Finish Renu','FINI','images/products/Finish Renu/18e19f7b7b82457f69f8b163ad22f988_fit.jpg'),
('9742b56f-8d37-5f6b-8666-6925ea5852b6','Finish Renu FR-86 Lemon Suds','','Finish Renu','FINI','images/products/Finish Renu/452961f36d213f1f850b2e0834564c34_fit.jpg'),
('1dfd5c14-8c43-5b1b-992b-b6eb426fb1b5','Finish Renu FR-37 Heat','','Finish Renu','FINI','images/products/Finish Renu/4d055e922eb07fbb8fb15f79b6706744_fit.jpg'),
('8be5074d-d7f8-566d-8f83-0c1eced77035','Finish Renu FR-34 Red Bull','','Finish Renu','FINI','images/products/Finish Renu/58cfde664be0fc46a9104811167dc8e6_fit.jpg'),
('3d4add39-8180-548c-a53c-1ccf705e1a6d','Finish Renu FR-139 EZ Shine Wax','','Finish Renu','FINI','images/products/Finish Renu/5a424ef386b2d17315d416e07a92b9a2_fit.jpg'),
('5c20e14a-9bf8-54b3-925e-12a66e4b7820','Finish Renu FR-63','','Finish Renu','FINI','images/products/Finish Renu/5b8a78f5ec81da28f08e8acc7360a060_fit.jpg'),
('42068fa9-15d8-5dec-98d1-16278c056f44','Finish Renu FR-88 Wash & Wax Soap','','Finish Renu','FINI','images/products/Finish Renu/6564af051dc3d055c02d971d8d38fce8_fit.jpg'),
('3a09b3ce-5d74-5b07-8a26-441ce4286891','Finish Renu FR-26 A.P.C. Citrus +','','Finish Renu','FINI','images/products/Finish Renu/72c7c1ca61944c46ba1c92f8368c67dd_fit.jpg'),
('b1b409c2-777d-5f2e-a2bb-bb249072f64d','Finish Renu FR-155 Absolute Wheel Cleaner','','Finish Renu','FINI','images/products/Finish Renu/790809434a3e242fa5201af1e2ea00a0_fit.jpg'),
('6fd86411-42d9-50a4-9acb-a11795abebd5','Finish Renu FR-104 Bug Off','','Finish Renu','FINI','images/products/Finish Renu/92bec6776062eea4262a9dae0e24c761_fit.jpg'),
('46e3a832-b05c-5b66-af5d-822c85daf338','Finish Renu FR-44 Diamond Gloss','','Finish Renu','FINI','images/products/Finish Renu/be5cebe2e4f79d0d5513e4f4677ae7ad_fit.jpg'),
('f2e0420f-e88e-559f-8292-1c9f0df0b18a','Finish Renu FR-071 Ceramic Wash','','Finish Renu','FINI','images/products/Finish Renu/f5317082325f62d115fb539f08b7a4f8_fit.jpg'),
('b758c472-d830-5d1e-9017-7f260eef9e58','Finish Renu Xtreme Renu Heavy Duty Exterior Wash','','Finish Renu','FINI','images/products/Finish Renu/f7253593ab33e0428eda1c28a1fdccb4_fit.jpg'),
('67818de4-2822-5bce-a0bf-d27d5571019e','Max Shine Purple Duo Twisted Drying Towel','24" x 36"','Max Shine','MAX','images/products/Max Shine/55d4ce1ead82ab3bed946517932db578_fit.jpg'),
('f7d00898-65ba-532b-b199-33c0705ce66a','Max Shine All Purpose Microfiber Towel Edgeless 5 Pack','16" x 16"','Max Shine','MAX','images/products/Max Shine/57e0975d226ce979184d49ee1e117d93_fit.jpg'),
('bea1166f-2960-5e7c-aa7c-daa20866145f','Max Shine Glass "Clean & Dry" Microfiber Towel','3 pack','Max Shine','MAX','images/products/Max Shine/9dea94c9feecba0735c69da9989ec4a7_fit.jpg'),
('43d95e29-2076-59e4-a36c-049abb58e533','Max Shine Crazy Plush Edge Microfiber Cleaning Towel','3 pack','Max Shine','MAX','images/products/Max Shine/f0eed0f073fc51c9d834a4505b9df98b_fit.jpg'),
('2d2bc81b-9eb1-50c2-abab-624439bfc091','Meguiar''s Hybrid Ceramic Detailer','','Meguiar''s','MEGU','images/products/Meguiar''s/0c0501b7553f247b2dbe249614b35f92_fit.jpg'),
('6627b40b-e48f-5fb0-ae4b-de035cf8cfdf','Meguiar''s Express Wash & Wax D115','','Meguiar''s','MEGU','images/products/Meguiar''s/135fd6ca7cc4793d74557098c788cb78_fit.jpg'),
('67e171c7-0408-511d-8940-5d48d8a67429','Meguiar''s Hyper Dressing D170','','Meguiar''s','MEGU','images/products/Meguiar''s/221942c4c68f66d829c02acaeb0e76ba_fit.jpg'),
('48076fca-7f1d-59e5-bbf5-668f2c833c09','Meguiar''s Last Touch Spray Detailer D155','','Meguiar''s','MEGU','images/products/Meguiar''s/3fa71a0154adc442e8adb7a99bed2b24_fit.jpg'),
('07046194-44b1-59ac-8632-974bb1941336','Meguiar''s Soft Buff Foam Cutting Disc 6" DFC6','','Meguiar''s','MEGU','images/products/Meguiar''s/4b31e3fb5cf1c741bc39c54ba1748558_fit.jpg'),
('985272e3-2061-5bb0-9ed5-f49fc3c5ce1d','Meguiar''s Finishing Wax D301','','Meguiar''s','MEGU','images/products/Meguiar''s/504bd423f0a1ef5533014dc4b23c769d_fit.jpg'),
('e0c2cac9-f539-5161-a9f0-bd8fd3b36003','Meguiar''s All Purpose Cleaner D101','','Meguiar''s','MEGU','images/products/Meguiar''s/573acf335844227014c12b6f3da8aa6f_fit.jpg'),
('ebac0487-dd3c-55f7-8870-b816d342e5ab','Meguiar''s Soft Buff Rotary Foam Polishing Pad WRFP7','','Meguiar''s','MEGU','images/products/Meguiar''s/8362252afe0e92e5b6a6e3beb51cc3be_fit.jpg'),
('c26cdbb4-f078-5643-880e-b9d7f5bdad8c','Meguiar''s Microfiber Wash Mitt','','Meguiar''s','MEGU','images/products/Meguiar''s/a7ce324f1114f030aabd2848881b8849_fit.jpg'),
('d84c772b-ea09-5710-ad0e-fde1e0723efc','Meguiar''s Shampoo Plus D111','','Meguiar''s','MEGU','images/products/Meguiar''s/eea07c19cae572775c344ceb2ec35a4e_fit.jpg'),
('12651ea0-0505-5858-8e56-ef566e14a153','Meguiar''s Finishing Wax D201','','Meguiar''s','MEGU','images/products/Meguiar''s/f414c1a941710898e06010592f82be4c_fit.jpg'),
('1828965d-ff42-5d86-8faa-ed776b4cad8e','Meguiar''s Wheel & Tire Cleaner D143','','Meguiar''s','MEGU','images/products/Meguiar''s/f6b9559fc1904ba6615bdfc65d19be90_fit.jpg'),
('a4148966-1ca3-5448-b0d2-c0d2dca58460','Sonax Iron + Fallout Remover','750 ml','Sonax','SONA','images/products/Sonax/0d180903bb5f7b2597988ba82ff37b85_fit.jpg'),
('ee983d7e-d4bd-5c5d-80eb-421bd7df6d59','Sonax Plastic Detailer','500 ml','Sonax','SONA','images/products/Sonax/32cde6c4ecd43f18355f69f094085d21_fit.jpg'),
('8aab8c45-9190-503a-9fcd-dddb8c6aaade','Sonax Cut + Finish 5/5','','Sonax','SONA','images/products/Sonax/361131b1e89d0228ba7761a349669bcf_fit.jpg'),
('91e71f0d-1007-501e-b4e7-331ba806f89d','Sonax Ceramic Spray Coating','750 ml','Sonax','SONA','images/products/Sonax/7405ed0b6e89899a781a92be2dae130c_fit.jpg'),
('546a2465-70ab-5ad4-8c9b-585927400467','Sonax Acid-Free Wheel Cleaner','500 ml','Sonax','SONA','images/products/Sonax/8a13a54db5ef0e991f1714b2ff4a1427_fit.jpg'),
('9c71ec46-675d-54c9-a1bd-fff099bdb0be','Sonax Car Wash Shampoo Concentrate','1000 ml','Sonax','SONA','images/products/Sonax/c71ffe48aee1cc46321029fc76ddbae5_fit.jpg'),
('e259810e-c872-5a58-b984-17abd477a6dc','Low Profile Water Tank — 60 Gal','60 gallons','Water Tanks','LOW','images/products/Water Tanks/500bf630dd84a9212c6f6d8a89845ca8_fit.jpg'),
('d621cf8b-8328-5b84-b43c-375910a80461','Water Tank — 70 Gal, Drain Long Side','70 gallons','Water Tanks','WATE','images/products/Water Tanks/597834cd35e559ef9cb30341f9f6d140_fit.jpg'),
('6765d894-8ed0-5347-ad0f-e181aa275d68','Water Tank — 70 Gal Low Profile, Custom Roto Mold','70 gallons','Water Tanks','WATE','images/products/Water Tanks/a7a8c3d3de4086c454dd191cc4ca8164_fit.jpg'),
('da741b66-4ba6-5bb6-816a-58ae0c02beaa','Water Tank for Pressure Washer — 100 Gal','100 gallons','Water Tanks','WATE','images/products/Water Tanks/d0c08abd7812b182252b93a46578b331_fit.jpg'),
('11c729e1-ecb1-5351-93d6-5e1941f6ba30','Dinowax Wall Display','Full Dinowax lineup on the shelf','Store Items','','images/products/Store Items/0409e9871fd93c32a3bd1c9674627147_fit.jpg'),
('991a7168-1411-565f-a35d-4b80483eea62','Air Fresheners','Air fresheners $10','Store Items','','images/products/Store Items/081f5ce3959521a85713a870f2c52a24_fit.jpg'),
('1cfeeba2-d12c-5116-92f4-66dfbdd73066','Caps','Trucker caps wall','Store Items','','images/products/Store Items/0b19b25355ebc91ba53afaaf94fed45d_fit.jpg'),
('e4a3c9cb-b108-5723-9c10-584e6e927f81','Microfiber Towels','Green fiber, blue soft and yellow soft towels','Store Items','','images/products/Store Items/0f52aa1cea7e2a5d06190e2aa0a8a3e3_fit.jpg'),
('ac5d7984-f83b-5a37-850b-de9f1bb68d66','Towel & Supply Aisle','Towels and detailing supplies','Store Items','','images/products/Store Items/5b7c7888b411c95e3d2c7024d0b5aeee_fit.jpg'),
('b024caf7-fd2d-5967-a500-6d16ff9d6119','P&S, Sonax & Mark V Shelf','Pro brand shelf','Store Items','','images/products/Store Items/95d538417227b131510ccc94c4d9444d_fit.jpg'),
('b2e173b4-669e-5196-9a92-1530a2647d82','Polishers, Brushes & Wash Guns','Display case','Store Items','','images/products/Store Items/a426d73f53356dc808fb40309718ebf4_fit.jpg'),
('95e60469-d6f4-5585-88a7-790eec640878','Max Shine Accessories','Clay bar, foam pads, ceramic coating and dryer','Store Items','','images/products/Store Items/c37c02e553a4b882e149630cc2b8f401_fit.jpg'),
('1e0aef08-1f92-511d-a0ec-73de843098cf','Bulk Gallons Shelf','Intensive, Masterson''s and Finish Renu gallons','Store Items','','images/products/Store Items/c72f2f2d62bdc6c3ee3a2c971c993e57_fit.jpg'),
('b96c2b2f-88e6-5aea-a3d3-5c8812476fc2','Max Shine Products Wall','Tire, water spot, glass and all-purpose cleaners plus towels','Store Items','','images/products/Store Items/cd0df0cce139d68392d3b89ae1695123_fit.jpg'),
('92d87feb-84e1-5d72-8b4a-a7b141750493','Meguiar''s Detailer Shelf','Detailer line gallons and bottles','Store Items','','images/products/Store Items/d3783007cace3111d694b23d72652b23_fit.jpg'),
('2d2fc58c-e675-5986-9358-0788f3382aab','Detailing Tools Wall','DA polishers, pads, brushes, mitts and wash guns','Store Items','','images/products/Store Items/d7801b9f9231e47ed9e6230a10f75738_fit.jpg'),
('fecfd1ea-324d-522b-844d-b3740d2eacd7','Spot-Free Water System','Spot-free water tanks','Store Items','','images/products/Store Items/d9b7fd67f2c9b572574b263f42fadaa7_fit.jpg'),
('f7a1c27d-894b-5daa-90ef-f6929beb35aa','Hoses, Spray Singles & Empty Bottles','Refill and accessory shelf','Store Items','','images/products/Store Items/fc885963d690a6787ca787cf208cdd25_fit.jpg')
on conflict (id) do nothing;

-- SEED: brands (7 rows)
--
insert into brands (id,name,tagline,initials,photo) values
('f6988a07-aa2a-53f9-a2ab-21e96303cb68','Meguiar''s','Available in-store','MEG','images/products/Meguiar''s/0c0501b7553f247b2dbe249614b35f92_fit.jpg'),
('392416a1-45fa-5b3f-922d-86adb89414ff','Sonax','Available in-store','SON','images/products/Sonax/0d180903bb5f7b2597988ba82ff37b85_fit.jpg'),
('9c6cc486-cae7-5b08-b71b-c20cb50a1bf8','Finish Renu','Available in-store','FR','images/products/Finish Renu/075c58569bacb4c755399cfd76b530c8_fit.jpg'),
('1e498050-5e43-5f2f-8551-a348dbfa868e','Dinowax','Available in-store','DINO','images/products/Dino Wax/053756619eabce598ef5470c2260cb50_fit.jpg'),
('daa859a7-9d2f-5e0d-bbbf-ddad93090c89','Max Shine','Available in-store','MS','images/products/Max Shine/55d4ce1ead82ab3bed946517932db578_fit.jpg'),
('6a42baa1-2e0b-53e7-b293-6d8dead46698','Store Items','Available in-store','SI','images/products/Store Items/5b7c7888b411c95e3d2c7024d0b5aeee_fit.jpg'),
('19b6cc9d-bb07-595c-9024-3561ea8c0827','Water Tanks','Available in-store','WT','images/products/Water Tanks/500bf630dd84a9212c6f6d8a89845ca8_fit.jpg')
on conflict (id) do nothing;

-- SEED: services (4 rows)
--
insert into services (id,title,description,photo,tag,cta_url) values
('7e3e112b-e691-56bb-8a27-93f2a277c1bb','Full Auto Detailing','Complete interior and exterior detailing. Your car comes out looking brand new — inside and out.','images/uploads/full-auto-detailing.jpg','Detailing','services.html'),
('8515200b-7107-5128-8b8e-5adeb5cfef56','Mobile Detailing','We come to you — home, apartment, or office. Punctual, professional, and done right the first time.','images/uploads/mobile-detailing.jpg','Detailing','services.html'),
('6c952965-a654-59cc-99af-0d7d998f997f','Supply Store','Professional-grade detailing products — the brands detailers ask for. Detailers welcome.','images/uploads/supply-store.jpg','Store','shop.html'),
('55ac4efb-4bed-5b7d-bee0-3ba1a4c8969b','Car Accessories','Shop our in-store selection of car accessories along with your detailing supplies.','images/uploads/car-accessories.jpg','Store','shop.html')
on conflict (id) do nothing;

-- SEED: packages (6 rows)
--
insert into packages (id,number,name,category,price_car,price_suv,price_truck,coupon,includes) values
('ceramic-soap-wash','1','Ceramic Soap Wash','express','$99.00','$109.00','$109.00','','[{"text": "Interior / Exterior"}, {"text": "Ceramic Wash"}, {"text": "Vacuum"}, {"text": "Interior cleaner"}, {"text": "Spray Wax"}, {"text": "Dash Board Cleaning"}, {"text": "Windows Cleaning"}, {"text": "Luxury Tire Dressing"}]'::jsonb)
on conflict (id) do nothing;
insert into packages (id,number,name,category,price_car,price_suv,price_truck,coupon,includes) values
('interior-supreme','2','Interior Supreme Detail','detail','$299.00','$349.00','$349.00','$50 OFF coupon available','[{"text": "Premium Interior Detail"}, {"text": "Vacuum"}, {"text": "Shampoo"}, {"text": "Conditioner"}, {"text": "Exterior Ceramic Wash"}, {"text": "Dash Board Cleaning"}, {"text": "Windows Cleaning"}, {"text": "Spray Wax"}, {"text": "Luxury Tire Dressing"}]'::jsonb)
on conflict (id) do nothing;
insert into packages (id,number,name,category,price_car,price_suv,price_truck,coupon,includes) values
('exterior-supreme','3','Exterior Supreme Detail','detail','$299.00','$349.00','$349.00','$50 OFF coupon available','[{"text": "Interior / Exterior Ceramic Wash"}, {"text": "Vacuum"}, {"text": "Conditioner"}, {"text": "Interior Cleaning"}, {"text": "Clay Bar"}, {"text": "Hand Wax"}, {"text": "Polish"}, {"text": "Windows Cleaning"}, {"text": "Luxury Tire Dressing"}]'::jsonb)
on conflict (id) do nothing;
insert into packages (id,number,name,category,price_car,price_suv,price_truck,coupon,includes) values
('full-supreme','4','Full Supreme Detail','detail','$449.00','$499.00','$499.00','$75 OFF coupon available','[{"text": "Full Detail Interior / Exterior"}, {"text": "Ceramic Wash"}, {"text": "Vacuum"}, {"text": "Shampoo"}, {"text": "Conditioner"}, {"text": "Clay Bar"}, {"text": "Hand Wax"}, {"text": "Polish"}, {"text": "Luxury Tire Dressing"}]'::jsonb)
on conflict (id) do nothing;
insert into packages (id,number,name,category,price_car,price_suv,price_truck,coupon,includes) values
('paint-correction','5','Paint Correction','premium','$799.00','$999.00','$1,199.00','','[{"text": "Spot Water Remove"}, {"text": "Ultimate Compound"}, {"text": "Supreme Ceramic wash"}, {"text": "Clay Bar"}, {"text": "Polish"}, {"text": "Hand Wax"}, {"text": "Interior Cleaner"}, {"text": "Conditioner"}, {"text": "Luxury Tire Dressing"}]'::jsonb)
on conflict (id) do nothing;
insert into packages (id,number,name,category,price_car,price_suv,price_truck,coupon,includes) values
('premium-ceramic','6','Premium Ceramic Coating','premium','$849.00','$1,199.00','$1,399.00','$100 / $150 / $200 OFF coupons available','[{"text": "Supreme Ceramic wash"}, {"text": "Supreme Interior Detail"}, {"text": "Paint Correction"}, {"text": "Conditioner"}, {"text": "Clay Bar"}, {"text": "Hand Wax"}, {"text": "Paint Disinfectant"}, {"text": "Premium Ceramic Coating"}, {"text": "Luxury Tire Dressing"}]'::jsonb)
on conflict (id) do nothing;

-- SEED: testimonials (3 rows)
--
insert into testimonials (id,name,quote) values
('60b8eba0-b91c-5aab-851b-d1adda98a4c8','Leonel F.','I drove all the way from Encino to Orange County just to get a special service for my vehicle at Oasis Detailing Supplies and I can honestly say it was worth every mile and penny.'),
('1bd479a3-2df5-5795-802f-9a5debbabca8','Walter V.','Didn''t try to sell me stuff I didn''t need, but gave me exactly what I needed. Very friendly service. Customer for life.'),
('ac53fd8d-e784-5dba-9a05-b9b4732f265c','Kenny G.','Hardest working guy in the business. Beautiful results. Worth it every time!')
on conflict (id) do nothing;

-- SEED: social_links (5 rows)
--
insert into social_links (id,name,url,icon) values
('89d21276-fd48-5df6-a162-faf50bc0816c','Facebook','https://www.facebook.com/oasisdetailingsupplies/','images/social-facebook.png'),
('bf397cb1-37fb-54fb-9487-394f7c35766a','Instagram','https://www.instagram.com/oasisdetailingsuppliesinc/','images/social-instagram.png'),
('c89db6b6-e79a-59b6-9614-549353200e2d','TikTok','https://www.tiktok.com/@oasisdetailingsupplies','images/social-tiktok.png'),
('ff07e6ba-5e5a-57d8-acd4-ef392805329e','YouTube','https://www.youtube.com/channel/UCeRoeXyDPKfJQIlPRWvPkFg','images/social-youtube.png'),
('223121ab-b8e0-5fd3-952a-d0dd3f1b1408','Yelp','https://www.yelp.com/biz/oasis-detailing-supplies-orange-3','images/social-yelp.png')
on conflict (id) do nothing;

-- SEED: site_settings (single row, id=1; merges content/settings.json + content/footer.json)
--
insert into site_settings (id,about_text,address,hours,phone1,phone1_href,phone2,phone2_href,water_text,hero_bg,water_bg,verse_text,verse_cite,copyright_text,address_line,logo_url) values
(1,
'Oasis Detailing Supplies is a family-owned business run by Joe and Angel. Known for honest advice — never selling you what you don''t need — and for treating every car like their own. Ask around Orange County: our customers drive from miles away, and they keep coming back.',
'223 S Tustin St, Orange, CA 92866',
'[{"days": "Monday – Thursday", "time": "7:30 AM – 5:00 PM"}, {"days": "Friday", "time": "7:00 AM – 5:00 PM"}, {"days": "Saturday", "time": "7:30 AM – 4:00 PM"}, {"days": "Sunday", "time": "Closed"}]'::jsonb,
'1-800-916-4731',
'+18009164731',
'714-363-3556',
'+17143633556',
'Available 24/7 — bring your jugs and fill up with spot-free water any time, day or night. No mineral spots, no water stains, unlike tap water. Our regulars fill up here for every car wash.',
'',
'',
'Believe in the Lord Jesus, and you will be saved — you and your household.',
'Acts 16:31',
'Oasis Detailing Supplies Inc — All rights reserved.',
'Oasis Detailing Supplies Inc · 223 S Tustin St, Orange, CA 92866',
'')
on conflict (id) do nothing;

-- ============================================================
-- STORAGE BUCKETS (created by this script itself)
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table products          enable row level security;
alter table brands             enable row level security;
alter table services           enable row level security;
alter table packages           enable row level security;
alter table testimonials       enable row level security;
alter table social_links       enable row level security;
alter table site_settings      enable row level security;
alter table appointments       enable row level security;
alter table contact_messages   enable row level security;

drop policy if exists "products_anon_select" on products;
create policy "products_anon_select" on products for select to anon using (true);
drop policy if exists "products_authenticated_all" on products;
create policy "products_authenticated_all" on products for all to authenticated using (true) with check (true);
drop policy if exists "brands_anon_select" on brands;
create policy "brands_anon_select" on brands for select to anon using (true);
drop policy if exists "brands_authenticated_all" on brands;
create policy "brands_authenticated_all" on brands for all to authenticated using (true) with check (true);
drop policy if exists "services_anon_select" on services;
create policy "services_anon_select" on services for select to anon using (true);
drop policy if exists "services_authenticated_all" on services;
create policy "services_authenticated_all" on services for all to authenticated using (true) with check (true);
drop policy if exists "packages_anon_select" on packages;
create policy "packages_anon_select" on packages for select to anon using (true);
drop policy if exists "packages_authenticated_all" on packages;
create policy "packages_authenticated_all" on packages for all to authenticated using (true) with check (true);
drop policy if exists "testimonials_anon_select" on testimonials;
create policy "testimonials_anon_select" on testimonials for select to anon using (true);
drop policy if exists "testimonials_authenticated_all" on testimonials;
create policy "testimonials_authenticated_all" on testimonials for all to authenticated using (true) with check (true);
drop policy if exists "social_links_anon_select" on social_links;
create policy "social_links_anon_select" on social_links for select to anon using (true);
drop policy if exists "social_links_authenticated_all" on social_links;
create policy "social_links_authenticated_all" on social_links for all to authenticated using (true) with check (true);
drop policy if exists "site_settings_anon_select" on site_settings;
create policy "site_settings_anon_select" on site_settings for select to anon using (true);
drop policy if exists "site_settings_authenticated_all" on site_settings;
create policy "site_settings_authenticated_all" on site_settings for all to authenticated using (true) with check (true);
drop policy if exists "appointments_anon_insert" on appointments;
create policy "appointments_anon_insert" on appointments for insert to anon with check (true);
drop policy if exists "appointments_authenticated_all" on appointments;
create policy "appointments_authenticated_all" on appointments for all to authenticated using (true) with check (true);
drop policy if exists "contact_messages_anon_insert" on contact_messages;
create policy "contact_messages_anon_insert" on contact_messages for insert to anon with check (true);
drop policy if exists "contact_messages_authenticated_all" on contact_messages;
create policy "contact_messages_authenticated_all" on contact_messages for all to authenticated using (true) with check (true);

-- ============================================================
-- STORAGE POLICIES (storage.objects)
-- Public read on both buckets; writes restricted to authenticated.
-- ============================================================

drop policy if exists "storage_public_read" on storage.objects;
create policy "storage_public_read"
on storage.objects for select
to public
using (bucket_id in ('product-images','site-assets'));

drop policy if exists "storage_auth_insert" on storage.objects;
create policy "storage_auth_insert"
on storage.objects for insert
to authenticated
with check (bucket_id in ('product-images','site-assets'));

drop policy if exists "storage_auth_update" on storage.objects;
create policy "storage_auth_update"
on storage.objects for update
to authenticated
using (bucket_id in ('product-images','site-assets'))
with check (bucket_id in ('product-images','site-assets'));

drop policy if exists "storage_auth_delete" on storage.objects;
create policy "storage_auth_delete"
on storage.objects for delete
to authenticated
using (bucket_id in ('product-images','site-assets'));

-- ============================================================
-- CHANGE LOG (admin "Recent changes" activity log + undo)
-- ============================================================

create table if not exists change_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_email text,
  entity text not null,
  entity_label text,
  record_id text,
  action text not null check (action in ('create','update','delete')),
  field_name text,
  old_value text,
  new_value text,
  old_row jsonb,
  new_row jsonb,
  undone boolean default false
);

create index if not exists idx_change_log_created on change_log (created_at desc);

alter table change_log enable row level security;

drop policy if exists "change_log_authenticated_all" on change_log;
create policy "change_log_authenticated_all" on change_log for all to authenticated using (true) with check (true);

-- End of schema. Verify with:
--   select count(*) from products;       -- expect 73
--   select count(*) from brands;         -- expect 7
--   select count(*) from services;       -- expect 4
--   select count(*) from packages;       -- expect 6
--   select count(*) from testimonials;   -- expect 3
--   select count(*) from social_links;    -- expect 5
--   select count(*) from site_settings;   -- expect 1
--   select id, name from storage.buckets where id in ('product-images','site-assets');
--   select count(*) from change_log;       -- expect 0 (fills as the admin is used)
