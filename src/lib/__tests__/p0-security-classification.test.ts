import {describe,expect,it} from "vitest";
import {inferAssetClass} from "../asset-classification";
import {isAllowedImageHost,isPublicIpAddress} from "../safe-url";
describe("classificação",()=>{
 it.each([["Apartamento T2","T2","apartment"],["Moradia","Moradia V3","house"],["Terreno urbano","Lote para construção","urban_land"],["Terreno rústico","Terreno agrícola","rural_land"],["Loja","Espaço comercial","commercial"],["Garagem","Box","garage"]])("classifica %s",(type,title,expected)=>expect(inferAssetClass(type,title).assetClass).toBe(expected));
 it("não inventa classe",()=>{expect(inferAssetClass(null,"Oportunidade").assetClass).toBe("unknown");expect(inferAssetClass("Imóvel","Propriedade").assetClass).toBe("mixed");});
});
describe("proxy",()=>{
 it("usa allowlist",()=>{expect(isAllowedImageHost("cdn.portal.pt",["portal.pt"])).toBe(true);expect(isAllowedImageHost("portal.pt.evil.test",["portal.pt"])).toBe(false);});
 it.each(["127.0.0.1","10.0.0.1","172.16.0.1","192.168.1.1","169.254.1.1","::1","fe80::1","fc00::1","224.0.0.1"])("bloqueia IP privado %s",ip=>expect(isPublicIpAddress(ip)).toBe(false));
 it("permite IP público",()=>expect(isPublicIpAddress("8.8.8.8")).toBe(true));
});
