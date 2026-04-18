# Guía de Contribución - FitAI 🚀

¡Qué onda equipo! Para que no nos hagamos bolas trabajando en el mismo repo, vamos a seguir estas reglas básicas:

## 🌿 Manejo de Ramas (Git Flow)
Nadie sube cambios directo a `main`. Usamos ramas según lo que estemos haciendo:
- `feature/nombre-tarea`: Para nuevas funcionalidades o pantallas.
- `bugfix/descripcion-error`: Para arreglar errores menores.
- `hotfix/error-critico`: Para arreglos urgentes o cambios de última hora.

**Flujo recomendado:**
1. Sincroniza tu local: `git pull origin main`
2. Crea tu rama: `git checkout -b feature/mi-mejora`
3. Haz tus cambios y commits.
4. Sube tu rama: `git push origin feature/mi-mejora`
5. Abre un Pull Request (PR) en GitHub para que alguien más lo revise.

## 📝 Mensajes de Commit
Tratemos de que sean claros y en español (o inglés, pero consistentes):
- `feat: agrega selector múltiple de alergias`
- `fix: corrige warning de SafeAreaView`
- `docs: actualiza el README`

## 🛠 Estándares de Código
- Usamos **TypeScript** para todo. Nada de `any`.
- Los componentes van en `src/components` y las pantallas en `src/screens`.
- Estilos: Preferimos usar el objeto `Colors` y `Spacing` de `src/theme/index.ts`.

## 🚀 Antes de subir cambios
- Asegúrate de que el proyecto compile (`npm start` o `expo start`).
- Revisa que no dejes `console.log` innecesarios.

---
¡A darle con todo! 🔥
