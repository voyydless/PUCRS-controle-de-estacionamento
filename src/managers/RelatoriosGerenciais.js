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
}