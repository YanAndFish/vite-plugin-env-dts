const box = document.getElementById('env-box')!

Object.entries(import.meta.env).forEach(([key, value]) => {
  const itembox = document.createElement('h3')
  itembox.innerText = `${key}: ${typeof value} = ${value}`

  box.appendChild(itembox)
})

export {}
