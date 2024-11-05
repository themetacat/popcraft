# PopCraft

[PopCraft](https://popcraft.pixelaw.xyz/) is the most composable Fully On-chain casual Game.

This repository contains the [Front-end](https://github.com/themetacat/popcraft.git) and [Smart Contract](https://github.com/themetacat/popcraft_contracts.git) code for [PopCraft](https://popcraft.pixelaw.xyz/).

## Demo
![ezgif-4-e5a6114ebb](https://github.com/user-attachments/assets/504dd211-e88d-4628-9100-0986145f9dbf)

## How to Play?
- PopCraft is a game like [PopStar!](https://play.google.com/store/apps/details?id=com.zplayworld.popstar&hl=en). 
- You can **earn rewards by eliminating all items on the board in 90s**.
- Multiple adjacent items can be **clicked to eliminate directly**. 
- Single items require **purchasing a prop to eliminate**.

## How it Bulit?
- [**PopCraft**](https://popcraft.pixelaw.xyz/) = **[PixeLAW](https://www.pixelaw.xyz/)**(Game Board) + **[ThisCursedMachine.fun](https://thiscursedmachine.fun/)**(Game Items) + **[Redswap](https://redswap.io/)**(Game Marketplace).

# Run it Locally

## Prerequisites
- [Node.js v18](https://nodejs.org/en/download/package-manager)
- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [pnpm](https://pnpm.io/)
`
sudo npm install -g pnpm
`

## Quickstart
### Step 1: Clone repo
`git clone https://github.com/themetacat/popcraft.git`

### Step 2: Install packages
`cd popcraft && pnpm install`

### Step 3: Deploy and Start
`pnpm run start`

### Step 4: Stop
##### <span style="background-color:yellow">\!\!\! Warning: Please be aware that this command will terminate all processes containing the keywords 'anvil' and 'vite'. Please use it with caution.</span>
`pnpm run stop`

## License
PopCraft([MUD](https://mud.dev/) Based) is open-source software [under the MIT license](https://github.com/themetacat/pixelaw_core/blob/main/LICENSE).
