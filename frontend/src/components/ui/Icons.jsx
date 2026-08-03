import React from 'react'
import {
  LuFire,
  LuMapPin,
  LuCheckCircle,
  LuTruck,
  LuUsers,
  LuZap,
  LuClock,
  LuShoppingCart,
  LuTool,
  LuDollarSign,
  LuEye,
  LuEyeOff,
  LuLoader2,
  LuCircle,
} from 'react-icons/lu'

// Simple icon mapper so we can replace emoji across the UI with consistent icons.
export default function Icon({ name, size = 18, color = 'currentColor', className = '' }) {
  const props = { size, color, className }
  switch (name) {
    case 'fire': return <LuFire {...props} />
    case 'map-pin': return <LuMapPin {...props} />
    case 'check': return <LuCheckCircle {...props} />
    case 'truck': return <LuTruck {...props} />
    case 'users': return <LuUsers {...props} />
    case 'zap': return <LuZap {...props} />
    case 'clock': return <LuClock {...props} />
    case 'cart': return <LuShoppingCart {...props} />
    case 'tool': return <LuTool {...props} />
    case 'dollar': return <LuDollarSign {...props} />
    case 'eye': return <LuEye {...props} />
    case 'eye-off': return <LuEyeOff {...props} />
    case 'loader': return <LuLoader2 {...props} />
    case 'circle': return <LuCircle {...props} />
    default: return <span style={{ display: 'inline-block', width: size, height: size }} />
  }
}
