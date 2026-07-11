# AgroSafra

MVP mobile Android offline-first para operacao agricola leve, com Home em estilo Dark Cyber, modulos locais e base reaproveitavel para a trilogia AgroSafra, AgroPecuaria e AgroLogistica.

## Arquitetura inicial

```text
.
|-- App.tsx
|-- app.json
|-- package.json
|-- src
|   |-- core
|   |   |-- cloud              # Contratos Firebase/Auth/Firestore
|   |   |-- p2p                # AgroSync Local / rede local
|   |   |-- storage            # Persistencia local offline-first
|   |   |-- sync               # Outbox e coordenador de sincronizacao
|   |   `-- theme              # Paleta Dark Cyber e tokens de UI
|   |-- features
|   |   `-- home               # Dashboard principal
|   `-- modules
|       |-- agrocalc           # Calculos de insumos e rendimento
|       |-- agroestoque        # Balanco de galpao
|       |-- agrolog            # Diario de bordo
|       |-- agromanual         # Receitas tecnicas
|       |-- agrotalk           # Avisos, chat, audio inteligente
|       |-- climate            # Previsao simples
|       `-- monetization       # Planos, ads e billing
```

## Rodar localmente

```powershell
npm install
npm run typecheck
npx expo start --host lan
```

Para abrir direto no emulador Android:

```powershell
npm run android
```

Para gerar um APK de teste instalavel no Android:

```powershell
npx eas-cli login
npm run build:android:preview
```

Veja [docs/ANDROID_RELEASE.md](docs/ANDROID_RELEASE.md).

> Evite `npm start -- --host lan` neste projeto: o npm pode repassar `lan` como raiz do projeto. Use `npx expo start --host lan`.

## Preview web / Railway

O app principal e Android, mas o projeto tambem gera uma versao web para preview e deploy no Railway.

```powershell
npm run build:web
npm run start:railway
```

O arquivo [railway.json](railway.json) configura o Railway para rodar `npm run build:web` e servir a pasta `dist`.

## Seguranca de dependencias

O projeto foi atualizado para Expo 57 e usa `overrides.uuid` para corrigir a cadeia transitiva `@expo/config-plugins -> xcode -> uuid`.

Validado com:

```powershell
npm audit
npx expo install --check
npm run typecheck
npm run build:web
```

## Decisoes do MVP

- UI feita em React Native/Expo para acelerar entrega Android sem prender a base em uma tela unica.
- Historicos locais e Outbox ficam atras de `src/core/storage`, hoje com AsyncStorage para leveza no MVP. A camada permite migrar para SQLite/WatermelonDB sem alterar as telas.
- Firebase fica limitado aos dados compartilhados: grupos, membros, avisos e chat recente.
- AgroSync Local foi isolado em `src/core/p2p` para receber uma implementacao nativa futura via NSD, Wi-Fi Direct ou WebSockets locais.
- Audio Talk Pro possui modelo de expiracao em 48h e flag `saved` para impedir limpeza automatica.

Veja tambem [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).