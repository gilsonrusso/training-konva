import JSZip from 'jszip'

/**
 * Compacta uma lista de arquivos File em um único Blob ZIP.
 *
 * @param files Array de objetos File (imagens, arquivos de texto, etc.) a serem compactados.
 * @param zipFileName Nome opcional para o arquivo ZIP gerado (ex: 'my_archive.zip').
 * Se não fornecido, o nome padrão será 'archive.zip'.
 * @returns Uma Promise que resolve para um Blob contendo o arquivo ZIP.
 */
export const zipFiles = async (
  files: File[],
  zipFileName: string = 'archive.zip'
): Promise<Blob> => {
  const zip = new JSZip()

  files.forEach((file) => {
    // Adiciona cada arquivo ao ZIP com seu nome original
    zip.file(file.name, file)
  })

  console.log(`Compactando ${files.length} arquivos em ${zipFileName}...`)

  // Gera o blob do ZIP
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE', // Tipo de compressão
    compressionOptions: {
      level: 9, // Nível de compressão (0-9, 9 é máximo)
    },
    // Você pode adicionar um callback para progresso se precisar de feedback durante a geração do ZIP
    // onUpdate: (metadata) => {
    //   console.log('Zip progress: ' + metadata.percent.toFixed(2) + '%');
    // }
  })

  console.log(`Arquivo ZIP '${zipFileName}' gerado com sucesso.`)
  return zipBlob
}
