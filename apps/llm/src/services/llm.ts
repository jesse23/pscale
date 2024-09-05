
const { PSCALE_OPENAI_API_KEY } = import.meta.env;

export async function compareFilesWithGPT(
  file1Content: string,
  file2Content: string
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PSCALE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
# Instructions
Compare 2 xml difference below for me and generate a patch script for other similar xml.

# Response
Response should be in below pattern only, each change should be a separate function.

\`\`\`javascript
{
  changeDivToDiv1: function(xmlStr) {
      return xmlStr.replace(/<div>/g, '<div1>').replace(/<\\/div>/g, '</div1>');
  }
}
\`\`\`

          `.trim(),
        },
        {
          role: 'user',
          content: `
Please compare the following two files:
source:
\`\`\`xml
${file1Content}
\`\`\`

target:
\`\`\`xml
${file2Content}
\`\`\`
          `.trim(),
        },
      ],
    }),
  });

  const data = await response.json();
  // console.log(data.choices[0].message);
  return data.choices[0].message.content;
}
