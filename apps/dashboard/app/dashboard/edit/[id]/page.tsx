import { createClient } from '../../../../utils/supabase/server'
import { notFound } from 'next/navigation'
import EditTriggerForm from './EditTriggerForm'

export default async function EditTriggerPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: trigger } = await supabase
    .from('video_triggers')
    .select('*')
    .eq('id', id)
    .single()

  if (!trigger) notFound()

  // On passe le trigger au composant client pour l'interactivité
  return <EditTriggerForm trigger={trigger} />
}