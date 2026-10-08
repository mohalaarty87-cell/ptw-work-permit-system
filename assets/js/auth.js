/* Supabase browser client bootstrap. The endpoint returns only public configuration. */
(()=>{'use strict';
const state={client:null,session:null,error:null};
state.ready=(async()=>{
  try{
    const response=await fetch('/api/config',{headers:{Accept:'application/json'},cache:'no-store'});
    const config=await response.json().catch(()=>null);
    if(!response.ok||!config?.url||!config?.publishableKey)throw new Error('configuration_unavailable');
    if(!window.supabase?.createClient)throw new Error('client_library_unavailable');
    state.client=window.supabase.createClient(config.url,config.publishableKey,{
      auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true,flowType:'pkce'}
    });
    const {data,error}=await state.client.auth.getSession();
    if(error)throw error;
    state.session=data.session||null;
  }catch(error){state.error=error?.message||'configuration_unavailable'}
  return state;
})();
window.HSEAuth=state;
})();

