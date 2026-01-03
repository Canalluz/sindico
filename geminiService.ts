
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getLegalAdvice = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: `És um assistente jurídico especializado no Regime Jurídico da Horizontal (RJH) de Portugal. 
        Ajuda administradores de condomínio a entender as leis, quóruns de votação, e obrigações fiscais. 
        Responde sempre em Português de Portugal. Usa termos como "Fração Autónoma", "Permilagem", "Quotas", "Fundo de Reserva".`,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, ocorreu um erro ao consultar o assistente jurídico.";
  }
};

export const generateMeetingNotice = async (title: string, date: string, time: string, local: string, items: string[]) => {
  try {
    const prompt = `Cria uma convocatória formal para uma Assembleia de Condomínio em Portugal. 
    Título: ${title}
    Data: ${date}
    Hora: ${time}
    Local: ${local}
    Pontos da Ordem do Dia: ${items.join(", ")}
    
    A convocatória deve seguir as normas do Código Civil Português (Artigo 1432º). 
    Deve incluir:
    1. Identificação clara do condomínio.
    2. Data, hora e local exatos.
    3. Ordem do dia detalhada.
    4. Informação sobre a segunda convocatória (caso não haja quórum na primeira).
    5. Menção à obrigatoriedade do Fundo de Reserva.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "És um administrador de condomínios experiente em Portugal. Escreve convocações formais, claras e juridicamente corretas em Português de Portugal.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao gerar convocatória.";
  }
};

export const generateMinutes = async (assemblyData: any) => {
  try {
    const prompt = `Redige a Ata Formal da Assembleia de Condomínio baseada nos seguintes dados reais da reunião:
    
    CONDOMÍNIO: ${assemblyData.buildingName}
    DATA: ${assemblyData.date}
    HORA INÍCIO: ${assemblyData.time}
    HORA FIM: ${assemblyData.endTime}
    LOCAL: ${assemblyData.location}
    PRESIDENTE: ${assemblyData.presidentName}
    SECRETÁRIO: ${assemblyData.secretaryName}
    
    LISTA DE PRESENTES:
    ${assemblyData.attendees.map((a: any) => `- ${a.name} (Fração: ${a.fractionCode}, Papel: ${a.role})`).join('\n')}
    
    DELIBERAÇÕES E VOTAÇÕES DETALHADAS:
    ${assemblyData.resolutions.map((r: any) => `
      PONTO: ${r.pointTitle}
      DESCRIÇÃO DA PROPOSTA VOTADA: ${r.proposalDescription}
      RESUMO DOS DEBATES: ${r.discussionSummary}
      VOTAÇÃO:
      - Votos a Favor (Sim): ${r.votesFor}
      - Votos Contra (Não): ${r.votesAgainst}
      - Abstenções: ${r.abstentions}
      - Permilagem Favorável: ${r.permilageFor}/1000
      DECISÃO FINAL: ${r.status === 'APPROVED' ? 'APROVADO' : 'REJEITADO'}
      MAIORIA EXIGIDA: ${r.majorityRequired}
    `).join('\n')}
    
    Instruções:
    - Segue rigorosamente o formalismo jurídico português para atas de condomínio.
    - Elabora o texto dos debates de forma profissional e concisa.
    - Menciona que a ata foi lida e aprovada por todos os presentes.
    - Inclui espaço para assinaturas no final.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "És um oficial de atas de condomínio em Portugal. Escreves atas detalhadas, formais e com validade jurídica em Português de Portugal.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao gerar a ata.";
  }
};
