import React, { useState, useRef } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef([])

  // Validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate password
  const validatePassword = (password) => {
    if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères'
    if (!/[A-Z]/.test(password)) return 'Le mot de passe doit contenir au moins une majuscule'
    if (!/[a-z]/.test(password)) return 'Le mot de passe doit contenir au moins une minuscule'
    if (!/[0-9]/.test(password)) return 'Le mot de passe doit contenir au moins un chiffre'
    return null
  }

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      toast.error('Veuillez entrer une adresse email valide')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('http://localhost:4000/api/auth/send-reset-otp', {
        email: email.toLowerCase().trim()
      })

      if (response.data.success) {
        toast.success('Code OTP envoyé à votre email!')
        setStep(2)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi du code')
    } finally {
      setLoading(false)
    }
  }

  // OTP Input Handlers
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    
    if (!/^\d+$/.test(pastedData)) {
      toast.error('Veuillez coller uniquement des chiffres')
      return
    }

    const newOtp = [...otp]
    pastedData.split('').forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char
      }
    })
    setOtp(newOtp)

    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault()

    const otpString = otp.join('')

    if (otpString.length !== 6) {
      toast.error('Veuillez entrer le code complet à 6 chiffres')
      return
    }

    toast.success('Code vérifié!')
    setStep(3)
  }

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()

    // Validate password
    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('http://localhost:4000/api/auth/reset-password', {
        email: email.toLowerCase().trim(),
        otp: otp.join(''),
        newPassword: newPassword
      })

      if (response.data.success) {
        toast.success('Mot de passe réinitialisé avec succès!')
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200'>
      <img 
        onClick={() => navigate('/')} 
        src={assets.logo} 
        alt="Logo" 
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer hover:scale-105 transition-transform' 
      />
      
      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300'>
        {/* Step Indicator */}
        <div className='flex justify-center items-center gap-2 mb-6'>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 1 ? 'bg-indigo-500 text-white' : 'bg-gray-600 text-gray-400'
          }`}>
            {step > 1 ? <CheckCircle size={16} /> : '1'}
          </div>
          <div className={`w-12 h-1 ${step >= 2 ? 'bg-indigo-500' : 'bg-gray-600'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 2 ? 'bg-indigo-500 text-white' : 'bg-gray-600 text-gray-400'
          }`}>
            {step > 2 ? <CheckCircle size={16} /> : '2'}
          </div>
          <div className={`w-12 h-1 ${step >= 3 ? 'bg-indigo-500' : 'bg-gray-600'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 3 ? 'bg-indigo-500 text-white' : 'bg-gray-600 text-gray-400'
          }`}>
            3
          </div>
        </div>

        <div className='text-center mb-6'>
          <h2 className='text-3xl font-semibold text-white mb-2'>
            {step === 1 && 'Mot de passe oublié?'}
            {step === 2 && 'Vérification'}
            {step === 3 && 'Nouveau mot de passe'}
          </h2>
          <p className='text-sm text-gray-400'>
            {step === 1 && 'Entrez votre email pour recevoir un code'}
            {step === 2 && 'Entrez le code à 6 chiffres'}
            {step === 3 && 'Créez votre nouveau mot de passe'}
          </p>
        </div>

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <Mail size={20} />
              <input 
                className='bg-transparent outline-none text-white w-full' 
                type="email" 
                placeholder="Votre email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium hover:from-indigo-600 hover:to-indigo-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Envoi...</span>
                </>
              ) : (
                <span>Envoyer le code</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className='flex gap-2 justify-center mb-6'>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type='text'
                  maxLength='1'
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className='w-12 h-14 text-center text-2xl font-bold bg-[#333A5C] text-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all'
                />
              ))}
            </div>

            <button 
              type="submit"
              disabled={otp.join('').length !== 6}
              className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium hover:from-indigo-600 hover:to-indigo-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Continuer
            </button>

            <div className='mt-4 text-center'>
              <button
                type="button"
                onClick={() => setStep(1)}
                className='text-gray-400 hover:text-white text-sm transition-colors'
              >
                Changer l'email
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Enter New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <Lock size={20} />
              <input 
                className='bg-transparent outline-none text-white w-full' 
                type={showPassword ? "text" : "password"}
                placeholder="Nouveau mot de passe" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className='text-gray-400 hover:text-white transition-colors'
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <Lock size={20} />
              <input 
                className='bg-transparent outline-none text-white w-full' 
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmer le mot de passe" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='text-gray-400 hover:text-white transition-colors'
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password Requirements */}
            <div className='text-xs text-gray-400 mb-4 px-2'>
              <p className='mb-1'>Le mot de passe doit contenir:</p>
              <ul className='list-disc list-inside space-y-1'>
                <li className={newPassword.length >= 8 ? 'text-green-400' : ''}>
                  Au moins 8 caractères
                </li>
                <li className={/[A-Z]/.test(newPassword) ? 'text-green-400' : ''}>
                  Une lettre majuscule
                </li>
                <li className={/[a-z]/.test(newPassword) ? 'text-green-400' : ''}>
                  Une lettre minuscule
                </li>
                <li className={/[0-9]/.test(newPassword) ? 'text-green-400' : ''}>
                  Un chiffre
                </li>
              </ul>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium hover:from-indigo-600 hover:to-indigo-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Réinitialisation...</span>
                </>
              ) : (
                <span>Réinitialiser le mot de passe</span>
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className='mt-6 text-center'>
          <button
            onClick={() => navigate('/login')}
            className='text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors'
          >
            <ArrowLeft size={16} />
            <span>Retour à la connexion</span>
          </button>
        </div>
      </div>      
    </div>
  )
}

export default ResetPassword