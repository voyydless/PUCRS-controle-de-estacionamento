export class RelatoriosGerenciais {
    constructor(cadastro, registro) {
        this.cadastro = cadastro;
        this.registro = registro;
    }

    // Calcula o total financeiro recebido dentro de uma janela de tempo específica
    arrecadacaoPorPeriodo(dataInicio, dataFim) {
        // Filtra apenas os tickets de carros que já saíram e cuja saída ocorreu dentro do período pesquisado
        const ticketsFiltrados = this.registro.tickets.filter(t => 
            t.dataSaida && t.dataSaida >= dataInicio && t.dataSaida <= dataFim
        );
        
        // Soma o valor pago de todos os tickets filtrados
        const total = ticketsFiltrados.reduce((acc, t) => acc + t.valorPago, 0);
        return total;
    }

    // Gera um panorama atual de um cliente pré-cadastrado (status financeiro e veículos no pátio)
    situacaoCliente(documento) {
        const cliente = this.cadastro.clientes.get(documento); 
        if (!cliente) return "Cliente não encontrado.";

        // Varre os tickets ativos para encontrar quais carros desse cliente estão no estacionamento agora
        const veiculosEstacionados = this.registro.tickets.filter(t => 
            cliente.placas.has(t.placa) && !t.dataSaida 
        );

        // Adapta a mensagem financeira de acordo com a regra de negócio de cada subclasse
        let financeiro = cliente.constructor.name === 'Estudante' ? `Saldo: R$${cliente.saldo}` :
                         cliente.constructor.name === 'Empresa' ? `Débito: R$${cliente.debitoAcumulado}` : "Isento";

        // Retorna um objeto estruturado para facilitar a exibição
        return {
            nome: cliente.nome,
            financeiro: financeiro,
            veiculosEstacionados: veiculosEstacionados.map(t => t.placa)
        };
    }

    // Levanta todos os clientes e veículos que estão com restrição de acesso por calote ou inadimplência
    clientesImpedidos() {
        const impedidos = [];
        
        // 1. Verifica os clientes avulsos
        // Como avulsos não têm cadastro, a restrição fica atrelada diretamente à placa do veículo no Set
        this.registro.listaBloqueioAvulsos.forEach(placa => impedidos.push(`Avulso - Placa Bloqueada: ${placa}`));

        // 2. Verifica os clientes corporativos
        // Empresas bloqueiam a entrada de todos os seus veículos cadastrados se a flag de inadimplência estiver ativa
        for (const cliente of this.cadastro.clientes.values()) {
            if (cliente.constructor.name === 'Empresa' && cliente.inadimplente) {
                impedidos.push(`Empresa - ${cliente.nome} (CNPJ: ${cliente.documento})`);
            }
        }
        return impedidos;
    }

    // Lista todos os registros de estacionamento de um cliente específico dentro de um período
    historicoClienteCadastrado(documento, dataInicio, dataFim) {
        const cliente = this.cadastro.clientes.get(documento); 
        if (!cliente) return "Cliente não encontrado.";

        // Filtra os tickets cruzando a validação no Set de placas do cliente e o intervalo de datas
        const historico = this.registro.tickets.filter(t => 
            cliente.placas.has(t.placa) && 
            t.dataEntrada >= dataInicio && 
            t.dataEntrada <= dataFim
        );

        // Retorna um objeto formatado que lista todos os veículos do cliente (caso ele tenha mais de um)
        return {
            cliente: cliente.nome,
            registros: historico.map(t => ({
                placa: t.placa,
                dataEntrada: t.dataEntrada.toLocaleString(),
                dataSaida: t.dataSaida ? t.dataSaida.toLocaleString() : "Ainda estacionado",
                pago: t.valorPago
            }))
        };
    }

    // Lista todos os registros de clientes não cadastrados dentro de um período
    historicoAvulso(dataInicio, dataFim) {
        const historico = this.registro.tickets.filter(t => 
            t.tipoCliente === 'ClienteAvulso' &&
            t.dataEntrada >= dataInicio && 
            t.dataEntrada <= dataFim
        );

        return historico.map(t => ({
            placa: t.placa,
            dataEntrada: t.dataEntrada.toLocaleString(),
            dataSaida: t.dataSaida ? t.dataSaida.toLocaleString() : "Ainda estacionado",
            pago: t.valorPago
        }));
    }

    // Gera um ranking dos 10 clientes que mais visitaram no ano informado
    top10Frequentes(ano) {
        const contagemFrequencia = new Map();
        const ticketsDoAno = this.registro.tickets.filter(t => 
            t.dataEntrada.getFullYear() === ano
        );

        for (const ticket of ticketsDoAno) {
            let chaveIdentificacao;
            // Busca no mapa de placas para ver se o dono é cadastrado
            const clienteCadastrado = this.cadastro.buscarClientePorPlaca(ticket.placa);

            if (clienteCadastrado) {
                // Se for cadastrado, agrupa pelo nome
                chaveIdentificacao = `Cadastrado - ${clienteCadastrado.nome}`;
            } else {
                // Clientes avulsos são identificados exclusivamente pela placa
                chaveIdentificacao = `Avulso - Placa ${ticket.placa}`;
            }

            // Incrementa o contador daquele cliente no Map. Se não existir, começa do zero e soma 1
            const totalAcessos = contagemFrequencia.get(chaveIdentificacao) || 0;
            contagemFrequencia.set(chaveIdentificacao, totalAcessos + 1);
        }

        // Converte o Map num Array para poder ordenar e cortar
        const ranking = Array.from(contagemFrequencia.entries())
            .sort((a, b) => b[1] - a[1]) // Ordena de forma decrescente
            .slice(0, 10); // Pega apenas os 10 primeiros colocados
        
        return ranking.map((item, index) => `${index + 1}º LUGAR: ${item[0]} -> ${item[1]} acessos`);
    }
}