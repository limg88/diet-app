-- Seed ingredients from docs/dieta.xlsx (banca dati + Foglio10/menu quantities)
-- Use: psql -v user_email='user@example.com'
BEGIN;
-- ROLLBACK;

WITH params AS (
  SELECT :'user_email'::text AS user_email
),
target_user AS (
  SELECT id FROM users u JOIN params p ON u.email = p.user_email
)
INSERT INTO ingredients (user_id, name, category, default_unit, default_quantity, allowed_meal_types)
SELECT target_user.id, v.name, v.category, v.default_unit, v.default_quantity, v.allowed_meal_types
FROM target_user
JOIN (VALUES
  ('anguria', NULL, 'gr', 400.0, NULL::text[]),
  ('arance', NULL, 'gr', 200.0, NULL::text[]),
  ('arista di maiale', 'Vegetables', 'gr', 300.0, NULL::text[]),
  ('banana', NULL, 'gr', 200.0, NULL::text[]),
  ('bastoncini', 'Vegetables', 'gr', 10.0, NULL::text[]),
  ('bevanda di riso', NULL, 'gr', 200.0, NULL::text[]),
  ('biscotti misura privolat', NULL, 'gr', 30.0, NULL::text[]),
  ('bresaola', NULL, 'gr', 80.0, NULL::text[]),
  ('broccoli', 'Vegetables', 'gr', 200.0, NULL::text[]),
  ('burro di arachidi', NULL, 'gr', 150.0, NULL::text[]),
  ('cachi', NULL, 'gr', 200.0, NULL::text[]),
  ('carote', 'Vegetables', 'gr', 150.0, NULL::text[]),
  ('cheerios', NULL, 'gr', 30.0, NULL::text[]),
  ('cioccolato fondente', NULL, 'gr', 80.0, NULL::text[]),
  ('fagiolini', 'Vegetables', 'gr', 400.0, NULL::text[]),
  ('farina di riso', NULL, 'gr', 50.0, NULL::text[]),
  ('fette biscottate', NULL, 'gr', 40.0, NULL::text[]),
  ('fiocchi di latte', 'Vegetables', 'gr', 330.0, NULL::text[]),
  ('fior di latte', 'Vegetables', 'gr', 150.0, NULL::text[]),
  ('frutta fresca', NULL, 'gr', 150.0, NULL::text[]),
  ('frutta secca', NULL, 'gr', 20.0, NULL::text[]),
  ('hamburger di pollo', 'Vegetables', 'gr', 200.0, NULL::text[]),
  ('mais', 'Vegetables', 'gr', 130.0, NULL::text[]),
  ('manzo magro macinato', 'Vegetables', 'gr', 200.0, NULL::text[]),
  ('marmellata', NULL, 'gr', 20.0, NULL::text[]),
  ('mela', NULL, 'gr', 200.0, NULL::text[]),
  ('melone', NULL, 'gr', 800.0, NULL::text[]),
  ('minestrone leggerezza', 'Vegetables', 'gr', 250.0, NULL::text[]),
  ('mirtilli', NULL, 'gr', 300.0, NULL::text[]),
  ('noci', NULL, 'gr', 10.0, NULL::text[]),
  ('pane', NULL, 'gr', 50.0, NULL::text[]),
  ('panko', 'Vegetables', 'gr', 30.0, NULL::text[]),
  ('peperoni', 'Vegetables', 'gr', 200.0, NULL::text[]),
  ('pesche', NULL, 'gr', 600.0, NULL::text[]),
  ('pomodorini', 'Vegetables', 'gr', 600.0, NULL::text[]),
  ('primosale', 'Vegetables', 'gr', 120.0, NULL::text[]),
  ('prosciutto crudo', NULL, 'gr', 160.0, NULL::text[]),
  ('prugne', NULL, 'gr', 600.0, NULL::text[]),
  ('rucola', 'Vegetables', 'gr', 150.0, NULL::text[]),
  ('salmone', 'Vegetables', 'gr', 200.0, NULL::text[]),
  ('salmone affumicato', 'Vegetables', 'gr', 80.0, NULL::text[]),
  ('salsiccia', 'Vegetables', 'gr', 200.0, NULL::text[]),
  ('taccole', 'Vegetables', 'gr', 600.0, NULL::text[]),
  ('tonno', 'Vegetables', 'gr', 200.0, NULL::text[]),
  ('tonno in scatola al naturale', 'Vegetables', 'gr', 50.0, NULL::text[]),
  ('uova di gallina', NULL, 'gr', 120.0, NULL::text[]),
  ('uva', NULL, 'gr', 820.0, NULL::text[]),
  ('valeriana', 'Vegetables', 'gr', 50.0, NULL::text[]),
  ('yogurt scremato', NULL, 'gr', 125.0, NULL::text[]),
  ('zucca', 'Vegetables', 'gr', 200.0, NULL::text[]),
  ('zuppa del casale', 'Vegetables', 'gr', 300.0, NULL::text[])
) AS v(name, category, default_unit, default_quantity, allowed_meal_types) ON TRUE;

WITH params AS (
  SELECT :'user_email'::text AS user_email
),
target_user AS (
  SELECT id FROM users u JOIN params p ON u.email = p.user_email
)
INSERT INTO ingredients (user_id, name, category, default_unit, allowed_meal_types)
SELECT target_user.id, v.name, v.category, v.default_unit, v.allowed_meal_types
FROM target_user
JOIN (VALUES
  ('albume', NULL, 'gr', NULL::text[]),
  ('crackers riso su riso', NULL, 'gr', NULL::text[]),
  ('fesa di tacchino', NULL, 'gr', NULL::text[]),
  ('funghi', 'Vegetables', 'gr', NULL::text[]),
  ('hamburger vegetale', 'Vegetables', 'gr', NULL::text[]),
  ('latte scramato', NULL, 'gr', NULL::text[]),
  ('lattuga', 'Vegetables', 'gr', NULL::text[]),
  ('melanzane', 'Vegetables', 'gr', NULL::text[]),
  ('miele', NULL, 'gr', NULL::text[]),
  ('pane tostato', NULL, 'gr', NULL::text[]),
  ('panino', NULL, 'gr', NULL::text[]),
  ('parmigiano', NULL, 'gr', NULL::text[]),
  ('passata di pomodoro', 'Vegetables', 'gr', NULL::text[]),
  ('pasta', 'Vegetables', 'gr', NULL::text[]),
  ('patate', 'Vegetables', 'gr', NULL::text[]),
  ('pera', NULL, 'gr', NULL::text[]),
  ('pesto', 'Vegetables', 'gr', NULL::text[]),
  ('petto di pollo', 'Vegetables', 'gr', NULL::text[]),
  ('philadelphia', 'Vegetables', 'gr', NULL::text[]),
  ('piselli', 'Vegetables', 'gr', NULL::text[]),
  ('polpo', 'Vegetables', 'gr', NULL::text[]),
  ('prosciutto cotto', NULL, 'gr', NULL::text[]),
  ('roastbeef', 'Vegetables', 'gr', NULL::text[]),
  ('te', NULL, 'gr', NULL::text[]),
  ('tris di verdure', 'Vegetables', 'gr', NULL::text[]),
  ('uova di gallina intero', NULL, 'gr', NULL::text[]),
  ('yogurt greco', NULL, 'gr', NULL::text[]),
  ('zucchine', 'Vegetables', 'gr', NULL::text[])
) AS v(name, category, default_unit, allowed_meal_types) ON TRUE;

WITH params AS (
  SELECT :'user_email'::text AS user_email
),
target_user AS (
  SELECT id FROM users u JOIN params p ON u.email = p.user_email
)
UPDATE ingredients i
SET category = CASE i.name
  WHEN 'anguria' THEN 'Fruit'
  WHEN 'arance' THEN 'Fruit'
  WHEN 'arista di maiale' THEN 'Protein'
  WHEN 'banana' THEN 'Fruit'
  WHEN 'bastoncini' THEN 'Vegetables'
  WHEN 'bevanda di riso' THEN 'Drinks'
  WHEN 'biscotti misura privolat' THEN 'Snacks'
  WHEN 'bresaola' THEN 'Protein'
  WHEN 'broccoli' THEN 'Vegetables'
  WHEN 'burro di arachidi' THEN 'Pantry'
  WHEN 'cachi' THEN 'Fruit'
  WHEN 'carote' THEN 'Vegetables'
  WHEN 'cheerios' THEN 'Grains'
  WHEN 'cioccolato fondente' THEN 'Snacks'
  WHEN 'fagiolini' THEN 'Vegetables'
  WHEN 'farina di riso' THEN 'Grains'
  WHEN 'fette biscottate' THEN 'Grains'
  WHEN 'fiocchi di latte' THEN 'Dairy'
  WHEN 'fior di latte' THEN 'Dairy'
  WHEN 'frutta fresca' THEN 'Fruit'
  WHEN 'frutta secca' THEN 'Snacks'
  WHEN 'hamburger di pollo' THEN 'Protein'
  WHEN 'mais' THEN 'Vegetables'
  WHEN 'manzo magro macinato' THEN 'Protein'
  WHEN 'marmellata' THEN 'Pantry'
  WHEN 'mela' THEN 'Fruit'
  WHEN 'melone' THEN 'Fruit'
  WHEN 'minestrone leggerezza' THEN 'Vegetables'
  WHEN 'mirtilli' THEN 'Fruit'
  WHEN 'noci' THEN 'Snacks'
  WHEN 'pane' THEN 'Grains'
  WHEN 'panko' THEN 'Grains'
  WHEN 'peperoni' THEN 'Vegetables'
  WHEN 'pesche' THEN 'Fruit'
  WHEN 'pomodorini' THEN 'Vegetables'
  WHEN 'primosale' THEN 'Dairy'
  WHEN 'prosciutto crudo' THEN 'Protein'
  WHEN 'prugne' THEN 'Fruit'
  WHEN 'rucola' THEN 'Vegetables'
  WHEN 'salmone' THEN 'Protein'
  WHEN 'salmone affumicato' THEN 'Protein'
  WHEN 'salsiccia' THEN 'Protein'
  WHEN 'taccole' THEN 'Vegetables'
  WHEN 'tonno' THEN 'Protein'
  WHEN 'tonno in scatola al naturale' THEN 'Protein'
  WHEN 'uova di gallina' THEN 'Protein'
  WHEN 'uva' THEN 'Fruit'
  WHEN 'valeriana' THEN 'Vegetables'
  WHEN 'yogurt scremato' THEN 'Dairy'
  WHEN 'zucca' THEN 'Vegetables'
  WHEN 'zuppa del casale' THEN 'Vegetables'
  WHEN 'albume' THEN 'Protein'
  WHEN 'crackers riso su riso' THEN 'Grains'
  WHEN 'fesa di tacchino' THEN 'Protein'
  WHEN 'funghi' THEN 'Vegetables'
  WHEN 'hamburger vegetale' THEN 'Vegetables'
  WHEN 'latte scramato' THEN 'Dairy'
  WHEN 'lattuga' THEN 'Vegetables'
  WHEN 'melanzane' THEN 'Vegetables'
  WHEN 'miele' THEN 'Pantry'
  WHEN 'pane tostato' THEN 'Grains'
  WHEN 'panino' THEN 'Grains'
  WHEN 'parmigiano' THEN 'Dairy'
  WHEN 'passata di pomodoro' THEN 'Pantry'
  WHEN 'pasta' THEN 'Grains'
  WHEN 'patate' THEN 'Vegetables'
  WHEN 'pera' THEN 'Fruit'
  WHEN 'pesto' THEN 'Pantry'
  WHEN 'petto di pollo' THEN 'Protein'
  WHEN 'philadelphia' THEN 'Dairy'
  WHEN 'piselli' THEN 'Vegetables'
  WHEN 'polpo' THEN 'Protein'
  WHEN 'prosciutto cotto' THEN 'Protein'
  WHEN 'roastbeef' THEN 'Protein'
  WHEN 'te' THEN 'Drinks'
  WHEN 'tris di verdure' THEN 'Vegetables'
  WHEN 'uova di gallina intero' THEN 'Protein'
  WHEN 'yogurt greco' THEN 'Dairy'
  WHEN 'zucchine' THEN 'Vegetables'
  ELSE i.category
END
FROM target_user
WHERE i.user_id = target_user.id
  AND i.name IN (
    'anguria','arance','arista di maiale','banana','bastoncini','bevanda di riso',
    'biscotti misura privolat','bresaola','broccoli','burro di arachidi','cachi','carote',
    'cheerios','cioccolato fondente','fagiolini','farina di riso','fette biscottate',
    'fiocchi di latte','fior di latte','frutta fresca','frutta secca','hamburger di pollo',
    'mais','manzo magro macinato','marmellata','mela','melone','minestrone leggerezza',
    'mirtilli','noci','pane','panko','peperoni','pesche','pomodorini','primosale',
    'prosciutto crudo','prugne','rucola','salmone','salmone affumicato','salsiccia','taccole',
    'tonno','tonno in scatola al naturale','uova di gallina','uva','valeriana','yogurt scremato',
    'zucca','zuppa del casale','albume','crackers riso su riso','fesa di tacchino','funghi',
    'hamburger vegetale','latte scramato','lattuga','melanzane','miele','pane tostato','panino',
    'parmigiano','passata di pomodoro','pasta','patate','pera','pesto','petto di pollo',
    'philadelphia','piselli','polpo','prosciutto cotto','roastbeef','te','tris di verdure',
    'uova di gallina intero','yogurt greco','zucchine'
  );

COMMIT;
