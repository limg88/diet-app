# Seed Report

## Category mapping
| Excel category | Mapped category |
| --- | --- |
| colazione | NULL |
| yogurt scremato | NULL |
| frutta | Fruit |
| verdura | Vegetables |
| carne e hamburger | Protein |
| pesce | Protein |
| latticini e salumi | NULL |
| carboidrati | Grains |

## Dedup results (banca dati)
- Total ingredients (raw): 146
- Unique normalized names: 127
- Deduplicated entries: 15

| Ingredient | Raw categories | Category kept | Note |
| --- | --- | --- | --- |
| albume | Colazione, verdura | NULL | category cleared (ambiguous) |
| bresaola | verdura, yogurt scremato | NULL | category cleared (ambiguous) |
| cioccolato fondente | Colazione, yogurt scremato | NULL | category cleared (ambiguous) |
| farina di riso | Colazione | NULL | kept |
| fesa di tacchino | verdura, yogurt scremato | NULL | category cleared (ambiguous) |
| melone | verdura, yogurt scremato | NULL | category cleared (ambiguous) |
| miele | Colazione, yogurt scremato | NULL | category cleared (ambiguous) |
| mirtilli | Colazione, yogurt scremato | NULL | category cleared (ambiguous) |
| pane tostato | Colazione, verdura, yogurt scremato | NULL | category cleared (ambiguous) |
| panino | verdura, yogurt scremato | NULL | category cleared (ambiguous) |
| prosciutto cotto | verdura, yogurt scremato | NULL | category cleared (ambiguous) |
| prosciutto crudo | verdura, yogurt scremato | NULL | category cleared (ambiguous) |
| te | Colazione, yogurt scremato | NULL | category cleared (ambiguous) |
| uova di gallina intero | Colazione, verdura | NULL | category cleared (ambiguous) |
| yogurt greco | Colazione, yogurt scremato | NULL | category cleared (ambiguous) |

## Ingredients skipped
- Skipped count: 48

| Sheet | Row(s) | Ingredient | Raw categories | Reason |
| --- | --- | --- | --- | --- |
| banca dati | 15 | albicocche | yogurt scremato | no unit source (not in menu or Foglio10) |
| banca dati | 30 | alici | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 16 | ananas | yogurt scremato | no unit source (not in menu or Foglio10) |
| banca dati | 19 | bevanda di soia | Colazione | no unit source (not in menu or Foglio10) |
| banca dati | 2 | bieta | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 3 | bietole | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 2 | biscotti magretti | Colazione | no unit source (not in menu or Foglio10) |
| banca dati | 26 | biscotti orosaiwa | Colazione | no unit source (not in menu or Foglio10) |
| banca dati | 31 | calamaro | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 4 | caponata | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 53 | ceci cotti | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 6 | cicoria | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 20 | ciliegie | yogurt scremato | no unit source (not in menu or Foglio10) |
| banca dati | 7 | cornflakes | Colazione | no unit source (not in menu or Foglio10) |
| banca dati | 54 | cous cous | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 82 | crostini | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 24 | dietetic dolcificante | Colazione | no unit source (not in menu or Foglio10) |
| banca dati | 22 | farino di avena | Colazione | no unit source (not in menu or Foglio10) |
| banca dati | 78 | feta | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 65 | filetto di manzo | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 8 | finocchi | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 9 | fiocchi di avena | Colazione | no unit source (not in menu or Foglio10) |
| banca dati | 21 | fragole | yogurt scremato | no unit source (not in menu or Foglio10) |
| banca dati | 55 | fresella | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 25 | hamburger di soia | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 10 | kefir | Colazione | no unit source (not in menu or Foglio10) |
| banca dati | 22 | kiwi | yogurt scremato | no unit source (not in menu or Foglio10) |
| banca dati | 23 | lamponi | yogurt scremato | no unit source (not in menu or Foglio10) |
| banca dati | 76 | lenticchie decorticate | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 23 | lievito in polvere | Colazione | no unit source (not in menu or Foglio10) |
| banca dati | 66 | lonza | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 24 | mandarini | yogurt scremato | no unit source (not in menu or Foglio10) |
| banca dati | 27 | manzo magro | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 32 | merluzzo | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 71 | orata | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 58 | pangrattato | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 33 | persico | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 61 | piadina | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 68 | pizza | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 34 | platessa | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 16 | pomodori da insalata | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 51 | ricotta | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 62 | riso | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 38 | seppie | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 70 | spigola | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 19 | spinaci | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 74 | tacchino | verdura | no unit source (not in menu or Foglio10) |
| banca dati | 41 | totano | verdura | no unit source (not in menu or Foglio10) |

## Menu items skipped
- User skipped count: 2
- Collaborator skipped count: 2

| Sheet | Row | Day | Meal type | Ingredient | Reason |
| --- | --- | --- | --- | --- | --- |
| menu (user) | 17 | 4 | DINNER | panino | missing unit |
| menu (user) | 23 | 6 | DINNER | pizza | missing quantity |
| menu (collab) | 41 | 3 | AFTERNOON_SNACK | miele | missing unit |
| menu (collab) | 52 | 6 | DINNER | pizza | missing quantity |
