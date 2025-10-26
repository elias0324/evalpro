import React, { useState, useRef, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'

const EmailVerify = () => {
  const navigate = useNavigate()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef([])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
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

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      toast.error('Veuillez entrer le code complet à 6 chiffres')
      return
    }

    setLoading(true)
    
    try {
      axios.defaults.withCredentials = true
      
      const response = await axios.post('http://localhost:4000/api/auth/verify-account', {
        otp: otpString
      })
      
      if (response.data.success) {
        toast.success('Email vérifié avec succès!')
        
        // Small delay then navigate (Sidebar will auto-refresh on focus)
        setTimeout(() => {
          navigate('/')
        }, 1000)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Verification error:', error)
      toast.error(error.response?.data?.message || 'Code OTP invalide ou expiré')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return

    setResendLoading(true)
    
    try {
      axios.defaults.withCredentials = true
      
      const response = await axios.post('http://localhost:4000/api/auth/send-verify-otp')
      
      if (response.data.success) {
        toast.success('Nouveau code OTP envoyé!')
        setCountdown(60)
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi du code')
    } finally {
      setResendLoading(false)
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
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
            <Mail size={32} className='text-white' />
          </div>
          <h2 className='text-3xl font-semibold text-white mb-2'>
            Vérification Email
          </h2>
          <p className='text-sm text-gray-400'>
            Entrez le code à 6 chiffres envoyé à votre email
          </p>
        </div>
        
        <form onSubmit={onSubmitHandler}>
          {/* OTP Input Boxes */}
          <div className='flex gap-2 justify-center mb-6'>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type='text'
                maxLength='1'
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={loading}
                className='w-12 h-14 text-center text-2xl font-bold bg-[#333A5C] text-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50'
              />
            ))}
          </div>

          <button 
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium hover:from-indigo-600 hover:to-indigo-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Vérification...</span>
              </>
            ) : (
              <span>Vérifier</span>
            )}
          </button>
        </form>

        {/* Resend OTP */}
        <div className='mt-6 text-center'>
          <p className='text-gray-400 text-sm mb-2'>
            Vous n'avez pas reçu le code?
          </p>
          {countdown > 0 ? (
            <p className='text-indigo-400 text-sm'>
              Renvoyer dans {countdown}s
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              disabled={resendLoading}
              className='text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto'
            >
              {resendLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Envoi...</span>
                </>
              ) : (
                <span>Renvoyer le code</span>
              )}
            </button>
          )}
        </div>

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

export default EmailVerify