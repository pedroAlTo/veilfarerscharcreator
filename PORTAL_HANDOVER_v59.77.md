# VeilFarers Portal v59.77 — handover

Date: 2026-07-22  
Baseline: v59.76  
Release package: `VeilFarers_Portal_v59.77.zip`

## Estado de la entrega

v59.77 implementa la sesión completa solicitada sobre el paquete v59.76. El ZIP está preparado como raíz directa de despliegue y conserva los sistemas canónicos, Firebase/Netlify y DiceBox existentes.

## Cambios realizados

### Dados y audio

- Se añadió `assets/dados_1.mp3` (4.075 s).
- `player-tool.jsx` usa un único `HTMLAudioElement` reutilizable para cada tirada.
- Una nueva tirada reinicia el audio desde cero.
- Cerrar/cancelar la animación 3D, activar el fallback 2D, agotar el timeout o cerrar el Roller detiene y rebobina el audio.
- El listener `veilfarers:dice3d-closed` mantiene audio y ciclo visual sincronizados.
- El efecto de `devicemotion` ahora depende también de `diceMode`, `dice3DStyle`, `diceTextureSet`, audio y volumen. Así Shake to Roll deja de conservar un closure 2D antiguo cuando el usuario ha elegido 3D.
- `player-tool.bundle.js` se regeneró desde `player-tool.jsx`.

### Cartas y Level Up

- `.vf-card-back-close` usa la misma esquina inferior derecha que `.vf-card-expand`.
- Los reversos de Level Up explican qué cambia, restricciones y ejemplos concretos.
- Personajes nuevos y estados normalizados conservan tres Experiences iniciales, todas con bono mínimo +2.
- Las opciones de Experience y Trait muestran el valor actual y el siguiente valor en verde brillante.
- Trait y New Domain Power usan un popup dedicado. La tarjeta sólo conserva la elección confirmada, por lo que ya no expande todas las opciones en una columna.
- `buildCardParticleField` se expone como `window.VFBuildCardParticleField`; cada Level Up seleccionado crea su propio campo. Varias tarjetas seleccionadas pueden mantener partículas simultáneamente.
- El frame y el sheen permanecen como capas directas del shell de la tarjeta, conservando la arquitectura v59.76 en ambas caras.
- Tras finalizar la animación de recompensa (~1.95 s), `body.vf-level-page-glow` pulsa brevemente los marcos de Level Up. La navegación no pertenece al selector y no brilla.

### Inventario

- Armory e Item Inventory muestran `img/class/06.png` como ilustración a color en el panel derecho.
- Se añadieron tres acciones: Player Tool, Charsheet y Both.
- La transferencia carga las cuatro colecciones canónicas (`weapons`, `armor`, `gear`, `augments`) aunque el usuario esté en una sola página.
- Player Tool recibe arsenal e IDs de inventario sin sustituir el arma/armadura activa ni los recursos actuales.
- Charsheet recibe las dos primeras armas, la primera armadura, hasta ocho Gear y hasta diez Augments en `veilfarers_sheet_fields_v2_40`.
- Si existe un Character Vault activo con ID permanente, la copia de Player Tool también se actualiza mediante `character-registry.js`.
- El resultado se muestra en un estado accesible `aria-live`; si no existe personaje en Player Tool, se explica qué debe abrir/importar primero.

## Archivos principales modificados

- `creator.html`
- `level-up.js`
- `armory.html`
- `items.html`
- `module.css`
- `catalog-page.js`
- `player-tool.jsx`
- `player-tool.bundle.js`
- `assets/3d-dice/vf-dice3d.js`
- `assets/dados_1.mp3`
- metadatos activos de release, headers y changelog

## Contratos de almacenamiento relevantes

- Inventario compartido: `veilfarers.inventory.v1`
- Player Tool: `veilfarers-player-tool-characters`
- Campos Charsheet: `veilfarers_sheet_fields_v2_40`
- Character ID activo: `veilfarers.character.currentId.v1`

La transferencia añade o actualiza equipamiento; no vacía los arsenales existentes ni cambia recursos de combate.

## Validación ejecutada

- 35 archivos JavaScript pasan `node --check`.
- 10 scripts inline HTML pasan parseo.
- 86 JSON se parsean correctamente.
- 11/11 HTML raíz declaran v59.77.
- CSS raíz pasa balance de llaves.
- `player-tool.bundle.js` coincide byte a byte con una recompilación limpia de `player-tool.jsx`.
- Smoke HTTP confirma que Creator, metadata v59.77, audio e ilustración responden desde la raíz del paquete.
- Contratos estáticos confirmados para audio/cancelación, dependencias Shake 3D, popups Level Up, partículas múltiples, transferencias y posición del botón reverso.

Consulta `VALIDATION_v59.77.txt` para el registro compacto.

## Aceptación pendiente en Deploy Preview

1. Autorizar sensores en iOS Safari y Android Chrome; confirmar Shake to Roll con 3D seleccionado.
2. Interrumpir una tirada 3D a mitad de movimiento; confirmar desaparición simultánea de dados y audio.
3. Probar Player Tool/Charsheet con un personaje real del Vault y revisar el inventario transferido.
4. Hacer una subida real con dos opciones de un slot, abrir ambos reversos y aplicar la subida.
5. Confirmar sincronización autenticada Keeper ↔ Player y ausencia de bucles 401.

No se afirma aceptación de sensores físicos, audio móvil ni servicios Netlify/Firebase sin Deploy Preview y dispositivo real.

## Instrucción para el siguiente chat

Usar `PORTAL_HANDOVER_v59.77.md` y `VeilFarers_Portal_v59.77.zip` como única base activa. No reconstruir desde v59.76 ni desde handovers históricos. Mantener los cambios en `player-tool.jsx` y regenerar `player-tool.bundle.js` después de cada edición JSX.
