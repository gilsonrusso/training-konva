type downloadURIProps = {
  uri: string | undefined
  name: string
}

export const downloadURI = ({ uri, name }: downloadURIProps) => {
  const link: HTMLAnchorElement = document.createElement('a')
  link.download = name
  link.href = uri || ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
