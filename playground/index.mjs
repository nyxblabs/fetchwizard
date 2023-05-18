import { $fetch } from '..'

async function main() {
   await $fetch('http://google.com/404')
}

main().catch((err) => {
   console.error(err)
   process.exit(1)
})
