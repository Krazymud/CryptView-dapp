
import cryptview from '@/components/cryptview-dapp'
import about from '@/components/cv-about'

const route = [
  {
    path: '/',
    name: 'cryptview',
    component: cryptview
  },
  {
    path: '/about',
    name: 'about',
    component: about
  }
]

export default route
