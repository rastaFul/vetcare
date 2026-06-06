# PRD — VetCare MVP

## 1. Problema

Veterinários autônomos gerenciam tutores, animais, histórico clínico, agenda e receituário com ferramentas fragmentadas (WhatsApp, papel, planilhas, Google Calendar separados). Não existe um sistema acessível e moderno projetado para esse perfil.

## 2. Solução

Sistema web centralizado, mobile-friendly, focado em velocidade de uso durante atendimento real. Integra com ferramentas já usadas (Google Calendar) sem impor mudança de comportamento.

## 3. Usuária Primária — Persona

**Dra. Ana (fictícia)** — Veterinária autônoma
- Atende ~8-12 animais/dia, domiciliar
- Usa Google Calendar para agenda pessoal
- Usa WhatsApp para comunicação com tutores
- Usa papel/bloco para anotações clínicas
- MEI, trabalha sozinha
- Precisa de: agilidade, histórico acessível, receituário profissional

**Dores principais:**
1. Histórico clínico espalhado (papel, memória, WhatsApp)
2. Receituário manual (word/papel) — pouco profissional
3. Lembretes de vacina/retorno dependem de memória
4. Não sabe quais animais têm retorno pendente sem olhar papel

## 4. Funcionalidades MVP

### F01 — Autenticação
- Login com Google (OAuth)
- Sessão persistente
- Logout seguro

### F02 — Tutores
- Cadastrar tutor (nome, CPF opcional, telefone, WhatsApp, email, endereço, observações)
- Listar tutores com busca (nome, telefone, email)
- Editar tutor
- Ver animais vinculados ao tutor
- Marcar tutor como inativo (soft delete)

### F03 — Animais
- Cadastrar animal (nome, espécie, raça, sexo, nascimento, peso, cor, castrado, microchip, foto, obs)
- Vincular a tutor existente
- Listar animais com filtros (espécie, tutor)
- Editar animal
- Ver histórico completo do animal (timeline)
- Marcar como inativo

### F04 — Consultas
- Criar consulta (animal, data, hora, endereço atendimento, status inicial: Agendada)
- Transitar status: Agendada → Confirmada → Concluída | Cancelada
- Ao concluir: preencher anamnese, diagnóstico, observações
- Criar evento Google Calendar ao agendar
- Atualizar evento ao editar data/hora
- Deletar evento ao cancelar
- Criar lembrete de retorno (opcional, via Google Calendar)

### F05 — Vacinação
- Registrar vacinação (animal, vacina, data aplicação, próxima dose, obs)
- Listar vacinas do animal
- Criar lembrete no Google Calendar para próxima dose (opcional)
- Visualizar vacinas próximas no dashboard

### F06 — Vermifugação
- Registrar vermifugação (animal, medicamento, data, próxima aplicação)
- Listar vermifugações do animal
- Lembrete próxima aplicação (opcional, Google Calendar)

### F07 — Antipulgas
- Registrar tratamento antipulgas (animal, medicamento, data, próxima aplicação)
- Listar tratamentos do animal
- Lembrete próxima aplicação (opcional, Google Calendar)

### F08 — Receituário
- Criar receita vinculada a consulta (diagnóstico, prescrição, posologia, obs)
- Gerar PDF profissional (dados vet + tutor + animal + prescrição)
- PDF armazenado no R2
- Download/visualização do PDF
- Listagem de receitas do animal

### F09 — Arquivos
- Upload de arquivo vinculado a animal ou consulta (PDF, JPG, PNG, max 10MB)
- Armazenamento R2 com presigned URL
- Download/visualização
- Tipo de arquivo: Exame, Foto, Laudo, Receita Externa, Outros
- Listagem de arquivos por animal

### F10 — Dashboard
- Consultas do dia (lista com status)
- Retornos pendentes (próximos 7 dias)
- Vacinas próximas (próximos 30 dias)
- Total animais cadastrados
- Total tutores cadastrados
- Acesso rápido a ações frequentes

### F11 — Timeline Clínica
- View unificada por animal
- Todos os eventos ordenados por data desc
- Tipos: Consulta, Vacinação, Vermifugação, Antipulgas, Receita, Arquivo
- Filtro por tipo
- Acesso rápido aos detalhes de cada evento

## 5. Critérios de Sucesso MVP

- Veterinária consegue registrar atendimento completo em < 3 minutos
- PDF de receita gerado em < 5 segundos
- Histórico de animal acessível em < 2 cliques
- Google Calendar sincronizado em tempo real
- Zero perda de dados (backup automático)

## 6. Fora do Escopo MVP

| Item | Motivo |
|------|--------|
| Financeiro/Cobrança | Complexidade; fase futura |
| Estoque de medicamentos | Fase futura |
| PIX/Pagamentos | Fase futura |
| WhatsApp automático | Integração paga; fase futura |
| IA clínica | Fase futura |
| App mobile nativo | Web responsivo suficiente para MVP |
| Multi-tenant UI | Infraestrutura preparada mas não exposta |
| Relatórios avançados | Fase futura |
