# Relatório — Reclassificação de imóveis `mixed` (pipeline)

- Query: `SELECT id, title, type, asset_class FROM properties WHERE asset_class = 'mixed'`
- Imóveis analisados: 22
- Mudaram de classe: 13
- Destino mixed: 9
- Destino garage: 1
- Destino urban_land: 12
- Mantiveram mixed: 9

## Detalhes

| id | de | para | motivo |
|---|---|---|---|
| ib-bra-2 | mixed | garage | Classe deduzida do texto: garagem/arrecadação |
| mp-bra-1 | mixed | urban_land | Classe deduzida do texto: terreno (PDM desconhecido) |
| el-bra-1 | mixed | urban_land | Classe deduzida do texto: terreno (PDM desconhecido) |
| est-por-1 | mixed | urban_land | Classe deduzida do texto: terreno (PDM desconhecido) |
| mart-bra-1 | mixed | urban_land | Classe deduzida do texto: terreno (PDM desconhecido) |
| gen-aveiro-1002 | mixed | urban_land | Classe deduzida do texto: terreno (PDM desconhecido) |
| gen-bragança-1017 | mixed | urban_land | Classe deduzida do texto: terreno (PDM desconhecido) |
| gen-coimbra-1022 | mixed | urban_land | Classe deduzida do texto: terreno (PDM desconhecido) |
| gen-évora-1029 | mixed | urban_land | Classe deduzida do texto: terreno (PDM desconhecido) |
| gen-faro-1032 | mixed | urban_land | Classe deduzida do texto: terreno (PDM desconhecido) |
| gen-leiria-1038 | mixed | urban_land | Classe deduzida do texto: terreno (PDM desconhecido) |
| gen-vianadocastelo-1067 | mixed | urban_land | Classe deduzida do texto: terreno (PDM desconhecido) |
| gen-açores-1083 | mixed | urban_land | Classe deduzida do texto: terreno (PDM desconhecido) |
