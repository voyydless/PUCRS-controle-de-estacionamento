class CadastroClientes {
    constructor() {
        this.clientes = new Map(); // Dicionário para gerenciar clientes
        this.mapaPlacas = new Map(); // Agiliza verificação de veículos e identificação do dono
    }

    cadastrarCliente(cliente) {
        this.clientes.set(cliente.documento, cliente); // Armazena CPF ou CNPJ e nome
        cliente.placas.forEach(placa => this.mapaPlacas.set(placa, cliente));
    }

    adicionarPlacaAoCliente(documento, placa) {
        const cliente = this.clientes.get(documento);
        if (cliente && !this.mapaPlacas.has(placa)) {
            cliente.adicionarPlaca(placa); // Respeita limites por categoria nas subclasses
            this.mapaPlacas.set(placa, cliente);
        }
    }

    buscarClientePorPlaca(placa) {
        return this.mapaPlacas.get(placa) || null;
    }
}

export { CadastroClientes };