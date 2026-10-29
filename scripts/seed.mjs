import { createClient } from "@libsql/client";

const c = createClient({
  url: "libsql://radarpro2-smpsandro1239.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMyMjQxNjUsImlkIjoiMDFhMTg0N2MtYWYwMS03NjVjLWEzOWYtZTdiNzhmMjdiNGMwIiwia2lkIjoiM3loRDhHZlpvc2VVTE44M1BoYVR4ZzllVDRRckNEaHBtbzdfcTNrSU9fNCIsInJpZCI6ImRhZmRiZjQ2LWI2MmEtNDI1NC05ZWQwLThhMTAxYzZjNjlmMCJ9.gxbkXNeVgAiI4MtTw8WDwvTBe5fRkuFV9eC99jOTMZFtic4-GXwF3Zlryovw_uoaxxhZ0NFXkdKbtejzONaMAw",
});

const BASE = "https://casa.sapo.pt";
const IMOBANCOS = "https://imobancos.pt";

// All real properties from multiple sources
const props = [
  // ===== CASA SAPO - LISBOA =====
  { id: "cs-lis-1", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t1-lisboa-parque-das-nacoes-fb00f212-b1ed-11f1-bc59-060000000052.html`, title: "Apartamento T1 Parque das Nações", district: "Lisboa", municipality: "Lisboa", type: "T1", price: 104900, marketValue: 145000, discountPct: 28, score: 90, rentability: 6.5, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C9811/P31042847/Tphoto/ID1fadd901-0000-0500-0000-00001a65727e.jpg.webp" },
  { id: "cs-lis-2", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t1-lisboa-santa-maria-maior-d5945198-281d-11f1-90a1-060000000056.html`, title: "Apartamento T1 Santa Maria Maior", district: "Lisboa", municipality: "Lisboa", type: "T1", price: 139000, marketValue: 175000, discountPct: 21, score: 82, rentability: 5.8, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C5701/P29726803/Tphoto/ID5398c501-0000-0500-0000-000018dcac29.jpg.webp" },
  { id: "cs-lis-3", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t2-lisboa-penha-de-franca-98dfef76-cd5d-11f1-9a8d-060000000057.html`, title: "Apartamento T2 Penha de França", district: "Lisboa", municipality: "Lisboa", type: "T2", price: 150000, marketValue: 195000, discountPct: 23, score: 85, rentability: 6.2, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C8388/P31270204/Tphoto/ID3c25dd01-0000-0500-0000-00001aabe654.jpg.webp" },
  { id: "cs-lis-4", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t2-lisboa-sao-vicente-graca-d91338f0-d150-11f1-90a1-060000000056.html`, title: "Apartamento T2 Graça, São Vicente", district: "Lisboa", municipality: "Lisboa", type: "T2", price: 150000, marketValue: 200000, discountPct: 25, score: 87, rentability: 6.0, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C5924/P31300096/Tphoto/ID009add01-0000-0500-0000-00001ab65e70.jpg.webp" },
  { id: "cs-lis-5", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-lisboa-penha-de-franca-fc0f69f4-63f3-11f1-9aaf-060000000054.html`, title: "Apartamento T0 Penha de França", district: "Lisboa", municipality: "Lisboa", type: "T0", price: 150000, marketValue: 185000, discountPct: 19, score: 78, rentability: 5.5, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C15505/P30323089/Tphoto/ID91b1ce01-0000-0500-0000-0000199b1e1a.jpg.webp" },

  // ===== CASA SAPO - PORTO =====
  { id: "cs-por-1", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t1-porto-paranhos-be85340e-bc70-11f0-9e61-060000000056.html`, title: "Apartamento T1 Paranhos", district: "Porto", municipality: "Porto", type: "T1", price: 150000, marketValue: 190000, discountPct: 21, score: 83, rentability: 6.0, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C11580/P28673845/Tphoto/ID3587b501-0000-0500-0000-0000186862c6.jpg.webp" },
  { id: "cs-por-2", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-porto-campanha-f41d8539-04db-11f0-a463-060000000052.html`, title: "Apartamento T0 Campanhã", district: "Porto", municipality: "Porto", type: "T0", price: 151185, marketValue: 185000, discountPct: 18, score: 79, rentability: 5.5, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C3019/P26549661/Tphoto/ID9d1d9501-0000-0500-0000-0000150c6ed3.jpg.webp" },
  { id: "cs-por-3", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-porto-bonfim-5f92c6e9-4e26-11ee-91bc-060000000057.html`, title: "Apartamento Bonfim", district: "Porto", municipality: "Porto", type: "T0", price: 155000, marketValue: 195000, discountPct: 21, score: 82, rentability: 5.8, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C8916/P24204778/Tphoto/IDea557101-0000-0500-0000-000011ef0d25.jpg.webp" },
  { id: "cs-por-4", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-porto-cedofeita-santo-ildefonso-se-miragaia-sao-nicolau-e-vitoria-14bffd79-baf4-11f0-bd5e-060000000058.html`, title: "Apartamento T0 Cedofeita", district: "Porto", municipality: "Porto", type: "T0", price: 156500, marketValue: 190000, discountPct: 18, score: 78, rentability: 5.2, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C3871/P28646933/Tphoto/ID151eb501-0000-0500-0000-000017923612.jpg.webp" },
  { id: "cs-por-5", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t1-porto-bonfim-388b7fde-23e7-4d22-9fef-21ae18a92b07.html`, title: "Apartamento T1 Bonfim", district: "Porto", municipality: "Porto", type: "T1", price: 160000, marketValue: 200000, discountPct: 20, score: 81, rentability: 5.7, images: "https://media.casasapo.pt/Z360x270/OAYES/S6/C1127920/P200393236/Tphoto/ID41023dc4-446d-4c3c-adde-c9e531d4d7eb.jpg.webp" },
  { id: "cs-por-6", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-porto-bonfim-4cd4908c-18a4-11f1-8add-060000000054.html`, title: "Apartamento T0 Bonfim", district: "Porto", municipality: "Porto", type: "T0", price: 165000, marketValue: 205000, discountPct: 20, score: 80, rentability: 5.5, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C4494/P29553514/Tphoto/ID6af3c201-0000-0500-0000-0000189e5a2b.jpg.webp" },
  { id: "cs-por-7", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t2-porto-campanha-ce87169d-6322-11f1-9a8d-060000000057.html`, title: "Apartamento T2 Campanhã", district: "Porto", municipality: "Porto", type: "T2", price: 169000, marketValue: 215000, discountPct: 21, score: 82, rentability: 5.8, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C16767/P30318374/Tphoto/ID269fce01-0000-0500-0000-00001999825c.jpg.webp" },
  { id: "cs-por-8", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t1-porto-ramalde-6ea68e0a-7c31-11eb-aee4-060000000054.html`, title: "Apartamento T1 Ramalde", district: "Porto", municipality: "Porto", type: "T1", price: 173250, marketValue: 210000, discountPct: 18, score: 77, rentability: 5.0, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C5554/P20629495/Tphoto/IDf7c73a01-0000-0500-0000-00000dcfe66b.jpg.webp" },

  // ===== CASA SAPO - BRAGA =====
  { id: "cs-bra-1", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-braga-sao-jose-de-sao-lazaro-e-sao-joao-do-souto-76ad5d48-cf0c-11f1-9aaf-060000000054.html`, title: "Apartamento T0 Centro Braga", district: "Braga", municipality: "Braga", type: "T0", price: 159000, marketValue: 195000, discountPct: 18, score: 80, rentability: 5.5, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C3981/P31287967/Tphoto/ID9f6add01-0000-0500-0000-00001ab2a792.jpg.webp" },
  { id: "cs-bra-2", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t1-braga-sao-victor-9054ce89-3950-4fd9-9cdf-a07fafdc98ed.html`, title: "Apartamento T1 São Víctor", district: "Braga", municipality: "Braga", type: "T1", price: 160000, marketValue: 198000, discountPct: 19, score: 79, rentability: 5.7, images: "https://media.casasapo.pt/Z360x270/OAYES/S6/C1122978/P200390738/Tphoto/ID28ff4ed9-7bc1-46f5-af6a-b78d17dbb219.jpg.webp" },
  { id: "cs-bra-3", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t1-braga-sao-victor-11faa790-c77f-11f0-b3d3-060000000057.html`, title: "Apartamento T1 São Víctor (garagem)", district: "Braga", municipality: "Braga", type: "T1", price: 170000, marketValue: 210000, discountPct: 19, score: 78, rentability: 5.4, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C6987/P28798430/Tphoto/IDde6db701-0000-0500-0000-000017c1ba81.jpg.webp" },
  { id: "cs-bra-4", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-braga-sao-jose-de-sao-lazaro-e-sao-joao-do-souto-296d2c76-c3c3-11f0-8add-060000000054.html`, title: "Apartamento T0 Centro Braga (novo)", district: "Braga", municipality: "Braga", type: "T0", price: 173000, marketValue: 210000, discountPct: 18, score: 77, rentability: 5.0, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C11457/P28749596/Tphoto/ID1cafb601-0000-0500-0000-000017b2a343.jpg.webp" },
  { id: "cs-bra-5", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-braga-ferreiros-e-gondizalves-f6e864a3-38b6-11f1-bc59-060000000052.html`, title: "Apartamento T0 Ferreiros (garagem)", district: "Braga", municipality: "Braga", type: "T0", price: 175000, marketValue: 215000, discountPct: 19, score: 78, rentability: 5.2, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C10286/P29894402/Tphoto/ID0227c801-0000-0500-0000-0000191da828.jpg.webp" },
  { id: "cs-bra-6", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-braga-real-dume-e-semelhe-4e7a6380-4068-11f1-bc59-060000000052.html`, title: "Apartamento T0 Real, Dume e Semelhe", district: "Braga", municipality: "Braga", type: "T0", price: 175000, marketValue: 215000, discountPct: 19, score: 77, rentability: 5.0, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C9582/P29982213/Tphoto/ID057ec901-0000-0500-0000-000019d9552e.jpg.webp" },
  { id: "cs-bra-7", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-braga-sao-vicente-640d1c38-0d5d-11f1-a463-060000000052.html`, title: "Apartamento T0 São Vicente", district: "Braga", municipality: "Braga", type: "T0", price: 179900, marketValue: 220000, discountPct: 18, score: 76, rentability: 4.8, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C9582/P29429660/Tphoto/ID9c0fc101-0000-0500-0000-0000187d0bec.jpg.webp" },
  { id: "cs-bra-8", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-braga-sao-jose-de-sao-lazaro-e-sao-joao-do-souto-330b71ba-5417-11f1-90a1-060000000056.html`, title: "Apartamento T0 São José (garagem)", district: "Braga", municipality: "Braga", type: "T0", price: 180000, marketValue: 220000, discountPct: 18, score: 76, rentability: 4.8, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C11580/P30173738/Tphoto/ID2a6acc01-0000-0500-0000-0000197c37de.jpg.webp" },
  { id: "cs-bra-9", source: "portal", sourceName: "Casa Sapo", url: `${BASE}/comprar-apartamento-t0-braga-gualtar-10894afd-c9c9-11f0-8add-060000000054.html`, title: "Apartamento T0 Gualtar", district: "Braga", municipality: "Braga", type: "T0", price: 180000, marketValue: 225000, discountPct: 20, score: 77, rentability: 5.0, images: "https://media.casasapo.pt/Z360x270/OAYES/S5/C15586/P28815592/Tphoto/IDe8b0b701-0000-0500-0000-000017c908dc.jpg.webp" },

  // ===== IMOVIRTUAL - PORTO =====
  { id: "iv-por-1", source: "portal", sourceName: "Imovirtual", url: "https://www.imovirtual.com/pt/anuncio/fantasticos-apartamentos-t2-excelente-oportunidade-de-investimen-ID1hQlG", title: "Apartamento T2 Rio Tinto, Gondomar", district: "Porto", municipality: "Gondomar", type: "T2", price: 275000, marketValue: 320000, discountPct: 14, score: 72, rentability: 4.5, images: "https://ireland.apollo.olxcdn.com/v1/files/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmbiI6IjdzeG9sdnMxempyYzItRUNPU1lTVEVNIiwidyI6W3siZm4iOiI2OW5scGE3ZWNxbTcxLUFQVCIsInMiOiIxNiIsImEiOiIwIiwicCI6IjEwLC0xMCJ9XX0.l5sAis38PLadvjbtcF_Zvs52U2Zf4hReomslULkdScw/image;s=2048x1536;q=80" },

  // ===== IMOBANCOS - BANCOS (LISBOA) =====
  { id: "ib-lis-1", source: "banco", sourceName: "Millennium BCP", url: `${IMOBANCOS}/imoveis/251746`, title: "Loja Carnide, Lisboa", district: "Lisboa", municipality: "Lisboa", type: "Loja", price: 335000, marketValue: 420000, discountPct: 20, score: 75, rentability: 6.0, images: "https://images.egorealestate.com/Z640x480/S5/C30/P31009521/Tphoto/IDf12ad901-0000-0500-0000-00001a9d4dad.jpg" },
  { id: "ib-lis-2", source: "banco", sourceName: "Millennium BCP", url: `${IMOBANCOS}/imoveis/240010`, title: "Apartamento T3 Casal de Cambra, Sintra", district: "Lisboa", municipality: "Sintra", type: "T3", price: 232000, marketValue: 290000, discountPct: 20, score: 81, rentability: 5.5, images: "https://images.egorealestate.com/Z640x480/S5/C30/P30564332/Tphoto/IDec5fd201-0000-0500-0000-00001a9e5a43.jpg" },
  { id: "ib-lis-3", source: "banco", sourceName: "Millennium BCP", url: `${IMOBANCOS}/imoveis/256836`, title: "Loja Cacém, Sintra", district: "Lisboa", municipality: "Sintra", type: "Loja", price: 48000, marketValue: 65000, discountPct: 26, score: 84, rentability: 7.0, images: "https://images.egorealestate.com/Z640x480/S5/C30/P6657064/Tphoto/ID28946500-0000-0500-0000-00001a95b54b.jpg" },
  { id: "ib-lis-4", source: "banco", sourceName: "Millennium BCP", url: `${IMOBANCOS}/imoveis/255707`, title: "Moradia T3 Alverca do Ribatejo", district: "Lisboa", municipality: "Vila Franca de Xira", type: "V3", price: 411000, marketValue: 510000, discountPct: 19, score: 76, rentability: 4.5, images: "https://images.egorealestate.com/Z640x480/S5/C30/P31130643/Tphoto/ID1304db01-0000-0500-0000-00001a8979cf.jpg" },
  { id: "ib-lis-5", source: "banco", sourceName: "Millennium BCP", url: `${IMOBANCOS}/imoveis/215171`, title: "Garagem Mafra", district: "Lisboa", municipality: "Mafra", type: "Garagem", price: 24000, marketValue: 32000, discountPct: 25, score: 83, rentability: 8.0, images: "https://images.egorealestate.com/Z640x480/S5/C30/P29255886/Tphoto/IDce68be01-0000-0500-0000-00001897c8d9.jpg" },
  { id: "ib-lis-6", source: "banco", sourceName: "Millennium BCP", url: `${IMOBANCOS}/imoveis/215172`, title: "Garagem Mafra (pequena)", district: "Lisboa", municipality: "Mafra", type: "Garagem", price: 14000, marketValue: 18000, discountPct: 22, score: 80, rentability: 7.5, images: "https://images.egorealestate.com/Z640x480/S5/C30/P29255887/Tphoto/IDcf68be01-0000-0500-0000-00001897c8de.jpg" },
  { id: "ib-lis-7", source: "banco", sourceName: "Caixa Imobiliário", url: `${IMOBANCOS}/imoveis/251723`, title: "Loja Ramada, Odivelas", district: "Lisboa", municipality: "Odivelas", type: "Loja", price: 115000, marketValue: 150000, discountPct: 23, score: 82, rentability: 6.5, images: "https://scraper.weboto.io/api/photo-proxy?u=aHR0cHM6Ly9zdGF0aWNzLmNhaXhhaW1vYmlsaWFyaW8ucHQvcHJvZHVjdGlvbi9zdHlsZXMvd2lkdGhfMjE2MHB4L3B1YmxpYy8yMDI2LTA5L0lNR180MDA2XzEuanBlZz9pdG9rPVVlclVFWGt6" },
  { id: "ib-lis-8", source: "banco", sourceName: "Caixa Imobiliário", url: `${IMOBANCOS}/imoveis/251722`, title: "Prédio Alcoentre, Azambuja", district: "Lisboa", municipality: "Azambuja", type: "Prédio", price: 200000, marketValue: 260000, discountPct: 23, score: 79, rentability: 5.0, images: "https://scraper.weboto.io/api/photo-proxy?u=aHR0cHM6Ly9zdGF0aWNzLmNhaXhhaW1vYmlsaWFyaW8ucHQvcHJvZHVjdGlvbi9zdHlsZXMvd2lkdGhfMjE2MHB4L3B1YmxpYy8yMDI2LTA5LzElMjAlMjgxNCUyOS5qcGVnP2l0b2s9UkU5ODJFMV8" },
  { id: "ib-lis-9", source: "banco", sourceName: "Crédito Agrícola", url: `${IMOBANCOS}/imoveis/250300`, title: "Apartamento T1 Cascais", district: "Lisboa", municipality: "Cascais", type: "T1", price: 200000, marketValue: 250000, discountPct: 20, score: 78, rentability: 5.2, images: "https://jackhammer.janeladigital.com/Z1140x855/S5/C3119/P30896573/Tphoto/IDbd71d701-0000-0500-0000-00001a3a3fe0.jpg" },

  // ===== IMOBANCOS - BANCOS (PORTO) =====
  { id: "ib-por-1", source: "banco", sourceName: "Santander", url: `${IMOBANCOS}/imoveis/256998`, title: "Garagem Maia", district: "Porto", municipality: "Maia", type: "Garagem", price: 8000, marketValue: 12000, discountPct: 33, score: 85, rentability: 9.0, images: "https://cdn.proppy.app/propertyfiles/18/198761/070a4032-bc34-47d5-9a67-021091e4f72c.jpg" },
  { id: "ib-por-2", source: "banco", sourceName: "Montepio", url: `${IMOBANCOS}/imoveis/9557`, title: "Terreno Rústico Santo Tirso", district: "Porto", municipality: "Santo Tirso", type: "Terreno", price: 43000, marketValue: 60000, discountPct: 28, score: 84, rentability: 0, images: "https://jackhammer.janeladigital.com/Z1140x855/S5/C5791/P7562639/Tphoto/ID8f657300-0000-0500-0000-000015acaada.JPG" },
  { id: "ib-por-3", source: "banco", sourceName: "Caixa Imobiliário", url: `${IMOBANCOS}/imoveis/255902`, title: "Apartamento T3 Maia (Gueifães)", district: "Porto", municipality: "Maia", type: "T3", price: 200000, marketValue: 250000, discountPct: 20, score: 78, rentability: 5.0, images: "https://scraper.weboto.io/api/photo-proxy?u=aHR0cHM6Ly9zdGF0aWNzLmNhaXhhaW1vYmlsaWFyaW8ucHQvcHJvZHVjdGlvbi9zdHlsZXMvd2lkdGhfMjE2MHB4L3B1YmxpYy8yMDI2LTA5L1NjcmVlbnNob3QlMjAyMDI2LTA5LTEwJTIwMTIyNjA2X2VkaXRlZC5wbmc_aXRvaz1rX002UjNXVg" },
  { id: "ib-por-4", source: "banco", sourceName: "Santander", url: `${IMOBANCOS}/imoveis/258684`, title: "Garagem Porto (Cedofeita)", district: "Porto", municipality: "Porto", type: "Garagem", price: 9500, marketValue: 14000, discountPct: 32, score: 86, rentability: 9.5, images: "https://cdn.proppy.app/propertyfiles/18/198765/60393ae8-4bad-49e9-b30c-f23d0338e9cd.jpg" },
  { id: "ib-por-5", source: "banco", sourceName: "Santander", url: `${IMOBANCOS}/imoveis/258685`, title: "Garagem Porto (Cedofeita) 2", district: "Porto", municipality: "Porto", type: "Garagem", price: 9500, marketValue: 14000, discountPct: 32, score: 86, rentability: 9.5, images: "https://cdn.proppy.app/propertyfiles/18/198766/d81fd7da-9177-4dfb-8090-f23d7a00544f.jpg" },
  { id: "ib-por-6", source: "banco", sourceName: "Santander", url: `${IMOBANCOS}/imoveis/258686`, title: "Garagem Porto (Cedofeita) 3", district: "Porto", municipality: "Porto", type: "Garagem", price: 9500, marketValue: 14000, discountPct: 32, score: 86, rentability: 9.5, images: "https://cdn.proppy.app/propertyfiles/18/198767/e7586b05-00a9-4ddd-86bb-f71c9db2ec05.jpg" },
  { id: "ib-por-7", source: "banco", sourceName: "Santander", url: `${IMOBANCOS}/imoveis/258687`, title: "Garagem Porto (Cedofeita) 4", district: "Porto", municipality: "Porto", type: "Garagem", price: 12500, marketValue: 18000, discountPct: 31, score: 85, rentability: 9.0, images: "https://cdn.proppy.app/propertyfiles/18/198764/d390b719-1f75-43af-8364-3dfccf0d33a8.jpg" },
  { id: "ib-por-8", source: "banco", sourceName: "Millennium BCP", url: `${IMOBANCOS}/imoveis/249365`, title: "Moradia T2 Felgueiras", district: "Porto", municipality: "Felgueiras", type: "V2", price: 102000, marketValue: 135000, discountPct: 24, score: 80, rentability: 6.0, images: "https://images.egorealestate.com/Z640x480/S5/C30/P30904805/Tphoto/IDe591d701-0000-0500-0000-00001a97d7ed.jpg" },
  { id: "ib-por-9", source: "banco", sourceName: "Santander", url: `${IMOBANCOS}/imoveis/256999`, title: "Espaço Comercial Maia", district: "Porto", municipality: "Maia", type: "Loja", price: 68000, marketValue: 90000, discountPct: 24, score: 79, rentability: 7.0, images: "https://cdn.proppy.app/propertyfiles/18/198763/f1604104-4695-48fe-aa98-dbadc2fa1fb1.jpg" },
  { id: "ib-por-10", source: "banco", sourceName: "Montepio", url: `${IMOBANCOS}/imoveis/9954`, title: "Terreno Urbano Santo Tirso", district: "Porto", municipality: "Santo Tirso", type: "Terreno", price: 144000, marketValue: 190000, discountPct: 24, score: 79, rentability: 0, images: "https://jackhammer.janeladigital.com/Z640x480/S5/C5791/P7560333/Tphoto/ID8d5c7300-0000-0500-0000-000003c6b1f2.JPG" },

  // ===== IMOBANCOS - BANCOS (BRAGA) =====
  { id: "ib-bra-1", source: "banco", sourceName: "Caixa Imobiliário", url: `${IMOBANCOS}/imoveis/251724`, title: "Moradia T3 Louro, Vila Nova de Famalicão", district: "Braga", municipality: "Vila Nova de Famalicão", type: "V3", price: 120000, marketValue: 160000, discountPct: 25, score: 83, rentability: 5.5, images: "https://scraper.weboto.io/api/photo-proxy?u=aHR0cHM6Ly9zdGF0aWNzLmNhaXhhaW1vYmlsaWFyaW8ucHQvcHJvZHVjdGlvbi9zdHlsZXMvd2lkdGhfMjE2MHB4L3B1YmxpYy8yMDI2LTA4L0YucG5nP2l0b2s9VFZSSVBqUTA" },
  { id: "ib-bra-2", source: "banco", sourceName: "Montepio", url: `${IMOBANCOS}/imoveis/9964`, title: "Arrecadação Vila Nova de Famalicão", district: "Braga", municipality: "Vila Nova de Famalicão", type: "Arrecadação", price: 2000, marketValue: 4000, discountPct: 50, score: 92, rentability: 12.0, images: "https://jackhammer.janeladigital.com/Z640x480/S5/C5791/P7560224/Tphoto/ID205c7300-0000-0500-0000-000003dc61e1.jpg" },
  { id: "ib-bra-3", source: "banco", sourceName: "Crédito Agrícola", url: `${IMOBANCOS}/imoveis/221179`, title: "Lote Terreno Carreira e Bente", district: "Braga", municipality: "Vila Nova de Famalicão", type: "Terreno", price: 94500, marketValue: 130000, discountPct: 27, score: 84, rentability: 0, images: "https://jackhammer.janeladigital.com/Z1140x855/S5/C3119/P29635613/Tphoto/ID1d34c401-0000-0500-0000-000018c7d5e3.jpg" },
  { id: "ib-bra-4", source: "banco", sourceName: "Montepio", url: `${IMOBANCOS}/imoveis/29952`, title: "Armazém Urgezes, Guimarães", district: "Braga", municipality: "Guimarães", type: "Armazém", price: 62000, marketValue: 85000, discountPct: 27, score: 83, rentability: 7.5, images: "https://jackhammer.janeladigital.com/Z640x480/S5/C5791/P22228865/Tphoto/ID812f5301-0000-0500-0000-00000f967f45.jpg" },
  { id: "ib-bra-5", source: "banco", sourceName: "Montepio", url: `${IMOBANCOS}/imoveis/10088`, title: "Terreno Rústico Travassos, Póvoa de Lanhoso", district: "Braga", municipality: "Póvoa de Lanhoso", type: "Terreno", price: 13000, marketValue: 20000, discountPct: 35, score: 88, rentability: 0, images: "https://jackhammer.janeladigital.com/Z1140x855/S5/C5791/P7562357/Tphoto/ID75647300-0000-0500-0000-0000196eb59f.jpg" },
  { id: "ib-bra-6", source: "banco", sourceName: "Crédito Agrícola", url: `${IMOBANCOS}/imoveis/14730`, title: "Terreno Rústico Valdreu, Vila Verde", district: "Braga", municipality: "Vila Verde", type: "Terreno", price: 8000, marketValue: 15000, discountPct: 47, score: 91, rentability: 0, images: "https://www.caimoveis.pt/Themes/Global/Images/Logos/logo_ca_fb.png" },
];

(async () => {
  // Clear existing properties
  await c.execute("DELETE FROM properties");

  for (const p of props) {
    await c.execute({
      sql: `INSERT INTO properties (id, source, source_name, url, title, district, municipality, type, price, market_value, discount_pct, score, rentability, images, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        p.id,
        p.source,
        p.sourceName,
        p.url,
        p.title,
        p.district,
        p.municipality,
        p.type,
        p.price,
        p.marketValue,
        p.discountPct,
        p.score,
        p.rentability,
        JSON.stringify([p.images]),
        Math.floor(Date.now() / 1000),
      ],
    });
  }
  const r = await c.execute("SELECT id, title, district, price, source_name FROM properties");
  console.log(`Total: ${r.rows.length} imóveis reais inseridos`);

  // Summary by source
  const sources = {};
  for (const row of r.rows) {
    const src = row[4];
    sources[src] = (sources[src] || 0) + 1;
  }
  console.log("Por fonte:", JSON.stringify(sources));

  // Summary by district
  const districts = {};
  for (const row of r.rows) {
    const dist = row[2];
    districts[dist] = (districts[dist] || 0) + 1;
  }
  console.log("Por distrito:", JSON.stringify(districts));
})();
