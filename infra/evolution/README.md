# Evolution API — WhatsApp Self-Hosted

Serviço de plataforma compartilhado para envio de mensagens WhatsApp via Evolution API.

## Pré-requisitos

- Docker e Docker Compose instalados
- Porta 8080 disponível

## Arquitetura

- `evolution-api` — API principal na porta 8080
- `evolution-db` — PostgreSQL 16 (necessário para Prisma migrations internas da Evolution API)

## Subir o serviço

```bash
cd /home/rodrigo/services/evolution
docker compose up -d
```

## Verificar se está rodando

```bash
curl http://localhost:8080/
```

Resposta esperada: JSON com informações da API.

## Criar instância WhatsApp

```bash
curl -s -X POST http://localhost:8080/instance/create \
  -H "apikey: vetcare-dev-key-local" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "vetcare",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'
```

## Conectar via QR Code

```bash
curl -s http://localhost:8080/instance/connect/vetcare \
  -H "apikey: vetcare-dev-key-local"
```

O campo `base64` na resposta contém o QR Code. Decodifique e escaneie com o WhatsApp do celular.

## Verificar instâncias

```bash
curl -s http://localhost:8080/instance/fetchInstances \
  -H "apikey: vetcare-dev-key-local"
```

## Parar o serviço

```bash
docker compose down
```

## Ver logs

```bash
docker compose logs -f
```

## Nota sobre risco de ban

- Usar apenas para envio a contatos que ja interagiram ou consentiram
- Volume baixo: menos de 200 mensagens por dia
- Nao usar para spam ou listas frias
- Respeitar horários comerciais para notificacoes automaticas
