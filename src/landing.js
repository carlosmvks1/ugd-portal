// Translate anchors from the previous two-page portal to the single-page sections.
// Anchors that still exist in the page (gestores, calidad, table, descentralizacion) are kept.
export const legacyAnchors={institucion:'la-ugd',cobertura:'presencia',
 documentos:'inicio',convenios:'inicio',observatorio:'inicio',modelo:'inicio',informacion:'inicio'};
export function followLegacyAnchor(){
 const target=legacyAnchors[location.hash.slice(1)];
 if(target)history.replaceState(history.state,'',location.pathname+location.search+'#'+target);
}
