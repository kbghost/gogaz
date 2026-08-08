import React from 'react'
import {
  LuFlame,
  LuMapPin,
  LuCircleCheck,
  LuCheck,
  LuTruck,
  LuUsers,
  LuUser,
  LuZap,
  LuClock,
  LuShoppingCart,
  LuWrench,
  LuDollarSign,
  LuEye,
  LuEyeOff,
  LuLoaderCircle,
  LuCircle,
  LuPhone,
  LuLogOut,
  LuSettings,
  LuSearch,
  LuPlus,
  LuTrash2,
  LuPencil,
  LuFilter,
  LuShieldCheck,
  LuArrowRight,
  LuStar,
  LuPackage,
  LuSun,
  LuMoon,
} from 'react-icons/lu'

// Icon mapper using Lucide icons via react-icons/lu
export default function Icon({ name, size = 18, color = 'currentColor', className = '' }) {
  const props = { size, color, className }
  switch (name) {
    case 'fire':
    case 'flame': return <LuFlame {...props} />
    case 'map-pin': return <LuMapPin {...props} />
    case 'check': return <LuCircleCheck {...props} />
    case 'check-simple': return <LuCheck {...props} />
    case 'truck': return <LuTruck {...props} />
    case 'users': return <LuUsers {...props} />
    case 'user': return <LuUser {...props} />
    case 'zap': return <LuZap {...props} />
    case 'clock': return <LuClock {...props} />
    case 'cart':
    case 'shopping-cart': return <LuShoppingCart {...props} />
    case 'tool':
    case 'wrench': return <LuWrench {...props} />
    case 'dollar': return <LuDollarSign {...props} />
    case 'eye': return <LuEye {...props} />
    case 'eye-off': return <LuEyeOff {...props} />
    case 'loader': return <LuLoaderCircle {...props} />
    case 'circle': return <LuCircle {...props} />
    case 'phone': return <LuPhone {...props} />
    case 'logout': return <LuLogOut {...props} />
    case 'settings': return <LuSettings {...props} />
    case 'search': return <LuSearch {...props} />
    case 'plus': return <LuPlus {...props} />
    case 'trash': return <LuTrash2 {...props} />
    case 'edit': return <LuPencil {...props} />
    case 'filter': return <LuFilter {...props} />
    case 'shield': return <LuShieldCheck {...props} />
    case 'arrow-right': return <LuArrowRight {...props} />
    case 'star': return <LuStar {...props} />
    case 'package': return <LuPackage {...props} />
    case 'sun': return <LuSun {...props} />
    case 'moon': return <LuMoon {...props} />
    default: return <span style={{ display: 'inline-block', width: size, height: size }} />
  }
}


