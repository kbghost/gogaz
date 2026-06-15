import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import ProtectedRoute from './components/ui/ProtectedRoute'

import Accueil            from './pages/client/Accueil'
import Commander          from './pages/client/Commander'
import CommanderAccessoires from './pages/client/CommanderAccessoires'
import SuiviCommande      from './pages/client/SuiviCommande'
import SuiviAccessoires   from './pages/client/SuiviAccessoires'
import MesCommandes       from './pages/client/MesCommandes'
import Tarifs             from './pages/client/Tarifs'
import Accessoires        from './pages/client/Accessoires'
import APropos            from './pages/client/APropos'
import Contact            from './pages/client/Contact'
import Login              from './pages/Login'
import Register           from './pages/Register'

import AdminLayout        from './pages/admin/AdminLayout'
import AdminDashboard     from './pages/admin/AdminDashboard'
import AdminCommandes     from './pages/admin/AdminCommandes'
import AdminProduits      from './pages/admin/AdminProduits'
import AdminUtilisateurs  from './pages/admin/AdminUtilisateurs'
import AdminCarte         from './pages/admin/AdminCarte'
import AdminSlider        from './pages/admin/AdminSlider'
import AdminAccessoires   from './pages/admin/AdminAccessoires'

import LivreurLayout      from './pages/livreur/LivreurLayout'
import LivreurDashboard   from './pages/livreur/LivreurDashboard'
import LivreurCommandes   from './pages/livreur/LivreurCommandes'
import LivreurAccessoires from './pages/livreur/LivreurAccessoires'
import WhatsAppButton from './components/ui/WhatsAppButton';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          <Route path="/"                        element={<Accueil />} />
          <Route path="/commander"               element={<Commander />} />
          <Route path="/commander-accessoires"   element={<CommanderAccessoires />} />
          <Route path="/suivi/:numero"           element={<SuiviCommande />} />
          <Route path="/suivi"                   element={<SuiviCommande />} />
          <Route path="/suivi-accessoires/:numero" element={<SuiviAccessoires />} />
          <Route path="/suivi-accessoires"       element={<SuiviAccessoires />} />
          <Route path="/tarifs"                  element={<Tarifs />} />
          <Route path="/accessoires"             element={<Accessoires />} />
          <Route path="/a-propos"                element={<APropos />} />
          <Route path="/contact"                 element={<Contact />} />
          <Route path="/login"                   element={<Login />} />
          <Route path="/register"               element={<Register />} />

          <Route path="/mes-commandes" element={
            <ProtectedRoute roles={['client']}>
              <MesCommandes />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index                 element={<AdminDashboard />} />
            <Route path="commandes"      element={<AdminCommandes />} />
            <Route path="produits"       element={<AdminProduits />} />
            <Route path="utilisateurs"   element={<AdminUtilisateurs />} />
            <Route path="carte"          element={<AdminCarte />} />
            <Route path="slider"         element={<AdminSlider />} />
            <Route path="accessoires"    element={<AdminAccessoires />} />
          </Route>

          <Route path="/livreur" element={
            <ProtectedRoute roles={['livreur', 'admin']}>
              <LivreurLayout />
            </ProtectedRoute>
          }>
            <Route index              element={<LivreurDashboard />} />
            <Route path="commandes"   element={<LivreurCommandes />} />
            <Route path="accessoires" element={<LivreurAccessoires />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <WhatsAppButton />
      </SocketProvider>
    </AuthProvider>
  )
}
