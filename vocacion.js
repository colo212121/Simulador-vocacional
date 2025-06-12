import { Ollama } from "@llamaindex/ollama";
import { Settings } from "llamaindex";
import readline from "readline";

const ollamaLLM = new Ollama({
  model: "qwen3:1.7b",
  temperature: 0.75,
});

Settings.llm = ollamaLLM;
Settings.embedModel = ollamaLLM;

const conversationHistory = []; // Memoria de conversación
let step = 0; // Control de etapas de la entrevista

const preguntas = [
  "¿Qué temas te interesan o te apasionan? (Por ejemplo: arte, tecnología, naturaleza, ayudar a otros...)",
  "¿Qué actividades disfrutás hacer en tu tiempo libre?",
  "¿Preferís trabajar con personas, con números, con objetos o con ideas?",
];

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("🎓 Bienvenido/a al Simulador Vocacional.");
  console.log("Te voy a hacer algunas preguntas para ayudarte a pensar posibles caminos. Escribí 'salir' para terminar.\n");

  // Comenzar con la primera pregunta
  console.log("🤖 " + preguntas[step]);

  rl.on("line", async (input) => {
    if (input.toLowerCase() === "salir") {
      rl.close();
      return;
    }

    // Guardar respuesta del usuario en la memoria
    conversationHistory.push({ role: "user", content: input });

    step++;

    if (step < preguntas.length) {
      // Hacer la siguiente pregunta
      console.log("🤖 " + preguntas[step]);
    } else {
      // Ya hicimos todas las preguntas: armar consulta con memoria
      conversationHistory.unshift({
        role: "system",
        content:
          "Eres un orientador vocacional amable y claro. A partir de las respuestas del usuario, recomendá 2 o más carreras posibles que se alineen con sus intereses. Explicá brevemente por qué cada una podría ser adecuada. Usá un tono cálido y accesible.",
      });

      try {
        const res = await ollamaLLM.chat({
          messages: conversationHistory,
        });

        const respuesta = res?.message?.content || res?.message || "";
        console.log("\n🤖 Sugerencias de carreras:\n" + respuesta.trim());
        console.log("\nPodés escribirme otra consulta o poner 'salir' para terminar.");
      } catch (err) {
        console.error("⚠️ Error al llamar al modelo:", err);
      }
    }
  });
}

main();
