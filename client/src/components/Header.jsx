import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { Award, FileText, Users, TrendingUp, Loader2 } from 'lucide-react'
import axios from 'axios'

const Header = () => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in and get user data
    const fetchUserData = async () => {
      try {
        // ⭐ IMPORTANT: Vérifier d'abord si un token existe
        const token = localStorage.getItem('token')
        
        if (!token) {
          setIsLoggedIn(false)
          setLoading(false)
          return
        }

        // Faire l'appel API avec le token si disponible
        const response = await axios.get('http://localhost:4000/api/user/data', {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.data.success) {
          setIsLoggedIn(true)
          setUserData(response.data.userData)
        } else {
          setIsLoggedIn(false)
          // Supprimer le token invalide
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.error('Erreur fetch user data:', error)
        setIsLoggedIn(false)
        // Si erreur 401, supprimer le token
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, []) // Se déclenche à chaque montage du composant

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-4 min-h-[500px]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  // Header for logged-in users
  if (isLoggedIn && userData) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-4">
        {/* User Avatar */}
        <div className='relative mb-8'>
          <div className='w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold border-4 border-white shadow-xl'>
            {userData.firstname?.charAt(0)}{userData.lastname?.charAt(0)}
          </div>
          <div className='absolute -bottom-2 -right-2 bg-green-500 rounded-full p-3 shadow-lg'>
            <Award className='w-6 h-6 text-white' />
          </div>
        </div>

        {/* Personalized Welcome */}
        <h1 className='flex items-center gap-2 text-2xl sm:text-4xl font-medium mb-3 text-gray-800'>
          Bonjour {userData.firstname} {userData.lastname}
          <img className='w-8 sm:w-10 aspect-square' src={assets.hand_wave} alt="" />
        </h1>

        <p className='text-gray-600 text-lg mb-2'>
          {userData.academicGrade?.replace(/_/g, ' ')} 
        </p>
        
        <p className='text-gray-500 text-sm mb-8'>
          {userData.institution?.replace(/_/g, ' ')}
        </p>

        {/* Account Verification Status */}
        {!userData.isAccountVerified && (
          <div className='mb-6 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg px-6 py-4 flex items-center gap-3 max-w-xl'>
            <div className='bg-orange-100 rounded-full p-2'>
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className='text-left flex-1'>
              <p className='text-sm font-semibold text-orange-800'>Compte non vérifié</p>
              <p className='text-xs text-orange-700'>Vérifiez votre email pour activer toutes les fonctionnalités</p>
            </div>
            <button 
              onClick={() => navigate('/email-verify')}
              className='text-xs bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition-colors'
            >
              Vérifier
            </button>
          </div>
        )}

        {/* Quick Stats Dashboard */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 w-full max-w-3xl'>
          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer'>
            <FileText className='w-8 h-8 text-blue-600 mb-2 mx-auto' />
            <p className='text-2xl font-bold text-gray-800'>12</p>
            <p className='text-xs text-gray-600'>Candidatures</p>
          </div>
          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer'>
            <Users className='w-8 h-8 text-purple-600 mb-2 mx-auto' />
            <p className='text-2xl font-bold text-gray-800'>8</p>
            <p className='text-xs text-gray-600'>Publications</p>
          </div>
          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer'>
            <Award className='w-8 h-8 text-orange-600 mb-2 mx-auto' />
            <p className='text-2xl font-bold text-gray-800'>5</p>
            <p className='text-xs text-gray-600'>Évaluations</p>
          </div>
          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer'>
            <TrendingUp className='w-8 h-8 text-green-600 mb-2 mx-auto' />
            <p className='text-2xl font-bold text-gray-800'>95%</p>
            <p className='text-xs text-gray-600'>Progression</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <button 
            onClick={() => navigate('/submissions')}
            className='bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-10 py-3.5 font-semibold hover:shadow-lg hover:scale-105 transition-all'
          >
            Nouvelle candidature
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className='border-2 border-gray-400 text-gray-700 rounded-full px-10 py-3.5 font-semibold hover:bg-gray-50 hover:border-gray-500 transition-all'
          >
            Mon profil
          </button>
        </div>
      </div>
    )
  }

  // Header for non-logged-in users (visitors)
  return (
    <div className="flex flex-col items-center justify-center text-center px-4">
      {/* Logo/Icon */}
      <div className='relative mb-8'>
        <img 
          src={assets.header_img} 
          alt="EvalPro"
          className='w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-xl' 
        />
        <div className='absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-3 shadow-lg'>
          <Award className='w-6 h-6 text-white' />
        </div>
      </div>

      {/* Welcome Message */}
      <h1 className='flex items-center gap-2 text-2xl sm:text-4xl font-medium mb-3 text-gray-800'>
        Bonjour Chercheurs
        <img className='w-8 sm:w-10 aspect-square' src={assets.hand_wave} alt="" />
      </h1>

      {/* Main Heading */}
      <h2 className='text-3xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
        Plateforme d'Évaluation Académique
      </h2>

      {/* Description */}
      <p className='text-gray-600 text-lg sm:text-xl mb-8 max-w-2xl leading-relaxed'>
        Soumettez vos candidatures, publiez vos travaux de recherche et suivez vos évaluations en toute simplicité
      </p>

      {/* Features */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 max-w-3xl'>
        <div className='flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow'>
          <FileText className='w-8 h-8 text-blue-600 mb-2' />
          <h3 className='font-semibold text-gray-800 mb-1'>Candidatures</h3>
          <p className='text-sm text-gray-600'>Soumettez facilement</p>
        </div>
        <div className='flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow'>
          <Users className='w-8 h-8 text-purple-600 mb-2' />
          <h3 className='font-semibold text-gray-800 mb-1'>Collaboration</h3>
          <p className='text-sm text-gray-600'>Travaillez ensemble</p>
        </div>
        <div className='flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow'>
          <TrendingUp className='w-8 h-8 text-green-600 mb-2' />
          <h3 className='font-semibold text-gray-800 mb-1'>Suivi</h3>
          <p className='text-sm text-gray-600'>Suivez vos progrès</p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <button 
          onClick={() => navigate('/login')}
          className='bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-10 py-3.5 font-semibold hover:shadow-lg hover:scale-105 transition-all'
        >
          Commencer maintenant
        </button>
        <button 
          onClick={() => navigate('/about')}
          className='border-2 border-gray-400 text-gray-700 rounded-full px-10 py-3.5 font-semibold hover:bg-gray-50 hover:border-gray-500 transition-all'
        >
          En savoir plus
        </button>
      </div>

      {/* Stats */}
      <div className='mt-12 grid grid-cols-3 gap-8 text-center'>
        <div>
          <p className='text-3xl sm:text-4xl font-bold text-blue-600'>500+</p>
          <p className='text-sm text-gray-600 mt-1'>Chercheurs</p>
        </div>
        <div>
          <p className='text-3xl sm:text-4xl font-bold text-purple-600'>1,200+</p>
          <p className='text-sm text-gray-600 mt-1'>Publications</p>
        </div>
        <div>
          <p className='text-3xl sm:text-4xl font-bold text-green-600'>95%</p>
          <p className='text-sm text-gray-600 mt-1'>Satisfaction</p>
        </div>
      </div>
    </div>
  )
}

export default Header