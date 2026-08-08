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
  LuHouse,
  LuLayoutDashboard,
  LuChartBar,
  LuImage,
  LuFuel,
  LuMap,
  LuX,
  LuMail,
  LuInfo,
  LuTriangleAlert,
  LuCircleX,
  LuLock,
  LuChevronRight,
  LuChevronLeft,
  LuChevronDown,
  LuChevronUp,
  LuCopy,
  LuRefreshCw,
  LuDownload,
  LuNavigation,
  LuBell,
  LuLayers,
  LuCircleHelp,
  LuSparkles,
  LuExternalLink,
  LuPhoneCall,
} from 'react-icons/lu'

// Icon mapper using Lucide icons via react-icons/lu
export default function Icon({ name, size = 18, color = 'currentColor', className = '' }) {
  const props = { size, color, className }
  switch (name) {
    case 'fire':
    case 'flame': return <LuFlame {...props} />
    case 'map-pin': return <LuMapPin {...props} />
    case 'map': return <LuMap {...props} />
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
    case 'loader':
    case 'spinner': return <LuLoaderCircle {...props} />
    case 'circle': return <LuCircle {...props} />
    case 'phone': return <LuPhone {...props} />
    case 'logout': return <LuLogOut {...props} />
    case 'settings': return <LuSettings {...props} />
    case 'search': return <LuSearch {...props} />
    case 'plus': return <LuPlus {...props} />
    case 'trash': return <LuTrash2 {...props} />
    case 'edit':
    case 'pencil': return <LuPencil {...props} />
    case 'filter': return <LuFilter {...props} />
    case 'shield': return <LuShieldCheck {...props} />
    case 'arrow-right': return <LuArrowRight {...props} />
    case 'star': return <LuStar {...props} />
    case 'package':
    case 'box': return <LuPackage {...props} />
    case 'sun': return <LuSun {...props} />
    case 'moon': return <LuMoon {...props} />
    case 'home': return <LuHouse {...props} />
    case 'dashboard': return <LuLayoutDashboard {...props} />
    case 'chart':
    case 'bar-chart': return <LuBarChart3 {...props} />
    case 'image':
    case 'slider': return <LuImage {...props} />
    case 'fuel':
    case 'gas': return <LuFuel {...props} />
    case 'close':
    case 'x': return <LuX {...props} />
    case 'mail':
    case 'email': return <LuMail {...props} />
    case 'info': return <LuInfo {...props} />
    case 'alert':
    case 'warning': return <LuTriangleAlert {...props} />
    case 'x-circle': return <LuCircleX {...props} />
    case 'lock': return <LuLock {...props} />
    case 'chevron-right': return <LuChevronRight {...props} />
    case 'chevron-left': return <LuChevronLeft {...props} />
    case 'chevron-down': return <LuChevronDown {...props} />
    case 'chevron-up': return <LuChevronUp {...props} />
    case 'copy': return <LuCopy {...props} />
    case 'refresh': return <LuRefreshCw {...props} />
    case 'download': return <LuDownload {...props} />
    case 'navigation': return <LuNavigation {...props} />
    case 'bell': return <LuBell {...props} />
    case 'layers': return <LuLayers {...props} />
    case 'help':
    case 'help-circle': return <LuCircleHelp {...props} />
    case 'external-link': return <LuExternalLink {...props} />
    case 'phone-call': return <LuPhoneCall {...props} />
    case 'sparkles': return <LuSparkles {...props} />
    default: return <span style={{ display: 'inline-block', width: size, height: size }} />
  }
}
