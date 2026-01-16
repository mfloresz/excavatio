# Ayudame a crear una app tipo chatgpt. Con las siguientes características.
La app su función principal es ayudar a estudiar pasajes bíblicos. Con ayuda de consultas a diferentes biblias.

## Funciones principales

La app debe funcionar 100% desde el navegador.
Puedes usar shadcn, rekaui, tailwindcss. Y cualquier otro módulo necesario pero con la característica de funcionar desde el navegador.
La app debe poder manejar un historial de chats.
Debe poder almacenar las apikey, así como añadir modelos adicionales, por el momento solo se soporta chutes como proveedor.
La app debe mostrar las respuestas en streaming y formateadas a markdown
La app debe poder descargar desde un repoositorio unos archivos xml. Estos corresponderán a las distintas versiones de la biblia. Tipo MCP o ToolCall.

# Provedor IA

Por el momento se soporta Chutes como proveedor:
En un selector de modelos lista los siguientes 'deepseek-ai/DeepSeek-V3.2-TEE' y openai/gpt-oss-120b-TEE'
Debe la app poder agregar después por parte del usuario nuevos modelos, así como sus parámetros personalizados, como max tokens, temperature, etc.

Te dejo el ejemplo api:
```
curl -X POST \
		https://llm.chutes.ai/v1/chat/completions \
		-H "Authorization: Bearer $CHUTES_API_TOKEN" \
	-H "Content-Type: application/json" \
	-d '  {
    "model": "openai/gpt-oss-120b-TEE",
    "messages": [
      {
        "role": "user",
        "content": "Tell me a 250 word story."
      }
    ],
    "stream": true,
    "max_tokens": 1024,
    "temperature": 0.7
  }'
  ```
# Forma de operación

El usuario comienza un chat o petición de explicar determinado pasaje.
El modelo recibe la petición y hace una tool call pidiendo los versículos necesarios.
El modelo recibe la respuesta con los versículos
El modelo realiza el análisis y realiza la respuesta.
El usuario puede seguir conversando con el modelo sobre ese pasaje, profundizando.
EL usuario puede iniciar otro chat y posteriormente continuarlo(historial)

# Archivos bíblicos

La app contará con los archivos 'AramaicBible.xml', 'GreekBYZ18Bible.xml', 'GreekTCGNTBible.xml', 'HebrewAleppoCodexBible.xml', 'HebrewLeningradCodexBible.xml', 'SpanishNBLABible.xml', 'SpanishRVR1960Bible.xml', 'SpanishTLABible.xml', 'GreekSBLGNTBible.xml'

Todos los xml tienen la siguiente estructura(solo cambia un tag como translation name o language, pero esto no es relevante y no cambia el orden):
```
<?xml version="1.0" encoding="UTF-8"?>
<bible translation="Spanish TLA (Traducción en Lenguaje Actual)" link="https://www.bible.com/bible/176/MAT.3.TLA" status="Traducción en lenguaje actual ® © Sociedades Bíblicas Unidas, 2002, 2004">
	<testament name="Old">
		<book number="1">
			<chapter number="1">
				<verse number="1">Cuando Dios comenzó a crear el cielo y la tierra,</verse>
```
El número tag testament es New o Old refiriendose a Nuevo Testamento u Antiguo Testamento
El tag book number corresponde al libro bíblico en número, consistiendo todos los xml en la versión de 66 libros.
El tag chapter number corresponde al número del capítulo del libro y verse number al versículo

# MCP o Tool Call

La app debe configurarse para que envie la petición api junto con el informe a una herramienta para extraer los versos requeridos.
La app debe encargarse de extraer los versos solicitados y devolverlos al modelo.

# Funcionamiento Local

Los archivos se deden descargar del repositorio y almacenarse en el indexeddb

# Prompt

El prompt principal se envia como rol de system, el cual es el siguiente:
```


