# AgroSafra

MVP mobile Android offline-first para operacao agricola leve, com Home em estilo Dark Cyber, modulos locais e base reaproveitavel para a trilogia AgroSafra, AgroPecuaria e AgroLogistica.

## O que ja funciona

- Onboarding local: perfil (nome + Patrao/Funcionario + codigo de grupo) salvo no aparelho.
- Home Dark Cyber com card de aviso AgroTalk, botao "Sede Sync" funcional, atalhos para 5 modulos, botao SOS que compartilha localizacao no WhatsApp.
- **AgroCalc**: form + calculo instantaneo + historico local.
- **AgroEstoque**: entradas/saidas/ajustes com saldo por item/unidade.
- **AgroLog**: iniciar / finalizar atividade por talhao, com observacoes.
- **AgroManual**: patrao cria receitas com passos e alertas de seguranca; funcionario le.
- **AgroTalk**: patrao publica avisos que vao para o mural e para a Outbox de sincronizacao.
- **Clima**: previsao simples via Open-Meteo (gratis, sem chave), com cache offline.
- **Sync coordenador**: tenta Cloud (Supabase, se configurado) e depois AgroSync Local (P2P).

## Arquitetura

```text
.
|-- App.tsx                       # Providers + navegacao
|-- app.json
|-- package.json
|-- src
|   |-- app
|   |   |-- navigation            # RootNavigator + types (React Navigation)
|   |   `-- session               # SessionContext + storage local
|   |-- core
|   |   |-- cloud                 # Firebase schema + Supabase client/gateway
|   |   |-- p2p                   # AgroSync Local / rede local
|   |   |-- storage               # AsyncStorage tipado
|   |   |-- sync                  # Outbox + coordinator
|   |   |-- theme                 # Paleta Dark Cyber, layout, typography
|   |   `-- utils                 # id + format (BRL, datas)
|   |-- features
|   |   |-- agrocalc, agroestoque, agrolog, agromanual, clima, agrotalk
|   |   |-- home                  # Dashboard principal
|   |   `-- onboarding
|   |-- modules                   # Modelos e regras puras por dominio
|   `-- ui                        # Screen, ScreenHeader, PrimaryButton, NeonInput, Card, EmptyState
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

## Backend opcional (Supabase)

O app funciona 100% offline. Se quiser ligar a nuvem via Supabase, copie `.env.example` para `.env` e preencha:

```text
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Se as variaveis existirem, o coordenador de sync usa `SupabaseSyncGateway` como canal Cloud automaticamente.

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
- Cloud tem dois gateways intercambiaveis: `SupabaseSyncGateway` (usado quando `EXPO_PUBLIC_SUPABASE_URL` esta setado) ou `CloudSyncGateway` stub (fallback).
- AgroSync Local foi isolado em `src/core/p2p` para receber uma implementacao nativa futura via NSD, Wi-Fi Direct ou WebSockets locais.
- Audio Talk Pro possui modelo de expiracao em 48h e flag `saved` para impedir limpeza automatica.

Veja tambem [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).