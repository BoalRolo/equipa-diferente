import React, { useState, useMemo } from "react";
import { Combobox } from "@headlessui/react";
import { Link } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import Header from "../components/Header";

interface FunctionItem {
  code: string;
  name: string;
}

// src/pages/FunctionNumberPage.tsx (trecho)
const FUNCTION_LIST: FunctionItem[] = [
  { code: "01", name: "Entrada de operador" },
  { code: "02", name: "Pausa" },
  { code: "03", name: "Sangria" },
  { code: "04", name: "Saída de operador" },
  { code: "05", name: "Abrir gaveta" },
  { code: "09", name: "Anular transação" },
  { code: "12", name: "Leitura de valores" },
  { code: "14", name: "Troca forma de pagamento" },
  { code: "15", name: "Reimprimir talão desconto" },
  { code: "26", name: "Alterar senha" },
  { code: "27", name: "Imprime rolo eletrónico" },
  { code: "28", name: "Venda por peso" },
  { code: "29", name: "Lista de funções" },
  { code: "30", name: "Ocorrência" },
  { code: "31", name: "Reforço de caixa" },
  { code: "32", name: "Venda por quantidade / granel" },
  { code: "34", name: "Número de série" },
  { code: "35", name: "Ativar cartão Dá" },
  { code: "36", name: "Consultar saldo cartão Dá" },
  { code: "37", name: "Desativar cartão Dá" },
  { code: "38", name: "Recarregar cartão Dá" },
  { code: "39", name: "Talão prenda" },
  { code: "42", name: "Carregar imagens" },
  { code: "43", name: "Talão verificação" },
  { code: "45", name: "Devolver vasilhame" },
  { code: "47", name: "Talão de entrega ao domicílio" },
  { code: "48", name: "Funções TPA" },
  { code: "50", name: "Recuperar pré-venda" },
  { code: "53", name: "Reimprimir cupão promocional" },
  { code: "54", name: "Vender artigo reservado" },
  { code: "56", name: "Recuperar transação selfscanning" },
  { code: "57", name: "Transação de compra" },
  { code: "59", name: "Outras receitas" },
  { code: "60", name: "Retirada p/despesas" },
  { code: "61", name: "Movimentação de Caixa" },
  { code: "62", name: "Enviar dinheiro" },
  { code: "63", name: "Levantar dinheiro" },
  { code: "65", name: "Cancelar envio" },
  { code: "69", name: "Fidelização" },
  { code: "74", name: "Ativar pin" },
  { code: "75", name: "Desistir pin" },
  { code: "76", name: "Alterar pin" },
  { code: "78", name: "Substituição fatura" },
  { code: "80", name: "Fatura completa" },
  { code: "81", name: "Indicar local descarga" },
  { code: "82", name: "Venda à Caixa" },
  { code: "89", name: "Calibração de ecrã" },
  { code: "90", name: "Desistir dados faturação" },
  { code: "96", name: "Dev. manual na própria Loja?" },
  { code: "97", name: "Impressão faturas instantdelivery" },
  { code: "98", name: "Impressão faturas instantdelivery ( contingência )" },
  { code: "99", name: "Registo manual QRcode" },
  { code: "1000", name: "Força preço" },
  { code: "1001", name: "Venda secção" },
  { code: "1002", name: "Anular artigo/f. pago" },
  { code: "1003", name: "Consulta preço" },
  { code: "1004", name: "Sair" },
  { code: "1005", name: "Fatura" },
  { code: "1006", name: "TPA fecho/abert" },
  { code: "1007", name: "Total" },
  { code: "1008", name: "Transação espera" },
  { code: "1009", name: "Recuperar transação" },
  { code: "1010", name: "Devolução" },
  { code: "1011", name: "Reimprimir cheque" },
  { code: "1017", name: "Transfira dados de referência delta" },
  { code: "1018", name: "Venda fracionada" },
  { code: "1019", name: "Venda por descrição" },
  { code: "1020", name: "Nota adicional" },
  { code: "1021", name: "Obtençãode dados" },
  { code: "1022", name: "Venda por imagem" },
  { code: "1023", name: "Adicionar parceiro" },
  { code: "1024", name: "Menu de configurações" },
  { code: "1025", name: "Caderneta digital" },
  { code: "1026", name: "Fatura recibo" },
  { code: "1027", name: "Tax free" },
  // { code: "2000", name: "" },
  { code: "9001", name: "On/off modo de segurança" },
];

export default function FunctionNumber() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FunctionItem | null>(null);
  const { isDarkMode } = useDarkMode();

  // filtra apenas quando o utilizador digita algo
  const filtered = useMemo<FunctionItem[]>(() => {
    if (!query) return [];
    return FUNCTION_LIST.filter((fn) =>
      fn.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Header />
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div
          className={`max-w-lg mx-auto ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg rounded-lg p-6 space-y-6`}
        >
          <Link
            to="/"
            className={`inline-flex items-center ${
              isDarkMode
                ? "text-yellow-400 hover:text-yellow-300"
                : "text-yellow-600 hover:text-yellow-800"
            }`}
          >
            ← Voltar à Home
          </Link>

          <h1
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Digite o nome da função para encontrar o nº respectivo
          </h1>

          <Combobox value={selected} onChange={setSelected}>
            <div className="relative">
              <Combobox.Input
                className={`w-full px-4 py-2 border ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                } rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500`}
                displayValue={(fn: FunctionItem) => fn?.name || query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite o nome da função..."
              />
              {filtered.length > 0 && (
                <Combobox.Options
                  className={`absolute z-10 mt-1 w-full ${
                    isDarkMode ? "bg-gray-700" : "bg-white"
                  } shadow-lg max-h-60 overflow-auto rounded-md ring-1 ring-black ring-opacity-5`}
                >
                  {filtered.map((fn) => (
                    <Combobox.Option
                      key={fn.code}
                      value={fn}
                      className={({ active }) =>
                        `cursor-pointer select-none px-4 py-2 ${
                          active
                            ? isDarkMode
                              ? "bg-gray-600 text-white"
                              : "bg-yellow-100 text-yellow-700"
                            : isDarkMode
                            ? "text-gray-200"
                            : "text-gray-900"
                        }`
                      }
                    >
                      {fn.name}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              )}
            </div>
          </Combobox>

          {selected && (
            <p
              className={`mt-4 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Função nº:{" "}
              <span
                className={`font-mono ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                } px-2 py-1 rounded`}
              >
                {selected.code}
              </span>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
