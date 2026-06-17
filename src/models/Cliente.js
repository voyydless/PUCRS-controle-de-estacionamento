class Cliente {
    constructor(documento, nome) {
        this.documento = documento;
        this.nome = nome;
        this.placas = new Set(); // Evita placas duplicadas 
    }

    adicionarPlaca(placa) {
        this.placas.add(placa);
    }

    removerPlaca(placa) {
        this.placas.delete(placa);
    }

    // Métodos polimórficos a serem sobrescritos
    calcularCusto(ticket) { throw new Error("Método abstrato"); }
    podeEntrar(placa, registrosAtivos) { throw new Error("Método abstrato"); }
}

export { Cliente };