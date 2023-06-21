import React,{useState,useEffect} from 'react'
import { AnimatePresence,motion } from 'framer-motion'
import { useSnapshot } from 'valtio'
import {config} from "../config/config"
import state from "../store"
import download from "../assets"
import {downLoadCanvasToImage,reader} from "../config/helpers"
import {EditorTabs,FilterTabs,DecalTypes} from "../config/constants"
 import { fadeAnimation,slideAnimation } from '../config/motion'
 import { AiPicker,ColorPicker,Tab,FilePicker, CustomButton } from '../components'
 import axios from "axios"
const Customizer = () => {
  const snap = useSnapshot(state)
  const [file,setFile]=useState("")
  const [prompt,setPrompt]=useState("")
  const [generatingImg,setGeneratingImg]=useState(false)
  const [activeEditorTab,setActiveEditorTab]=useState(false)
  const [activeFilterTab,setActiveFilterTab]=useState({
    logoShirt:true,
    stylishShirt:false
  })
  const generateTabContent=()=>{
    switch(activeEditorTab){
      case "colorpicker":
        return <ColorPicker/> 
        case "filepicker":
          return <FilePicker readFile={readFile} file={file} setFile={setFile} /> 
          case "aipicker":
            return <AiPicker prompt={prompt} setPrompt={setPrompt} generatingImg={generatingImg}
            handleSubmit={handleSubmit}
             />
            default:
              return null   
    }}

    const handleSubmit = async (type) => {
      if(!prompt) return alert("Please enter a prompt");
  
      try {
        setGeneratingImg(true);
  
        const response = await fetch('http://localhost:8080/api/v1/dalle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt,
          })
        })
       
  
        const data = await response.json();
        console.log(data);
  
        handleDecals(type, `data:image/png;base64,${data.photo}`)
      } catch (error) {
        alert(error)
      } finally {
        setGeneratingImg(false);
        setActiveEditorTab("");
      }
    }
    const handleActiveFilterTab=(tabName)=>{
      switch(tabName){
        case "logoShirt":
          state.isLogoTexture= !activeFilterTab[tabName];
          break;
        case "stylishShirt":
          state.isFullTexture= !activeFilterTab[tabName];
          break;  
        default:
          state.isLogoTexture=true
          state.isFullTexture=false
          
      }
      setActiveFilterTab(prev=>{
        return {
          ...prev,[tabName]:!prev[tabName]
        }
      })

    }

    const handleDecals=(type,result)=>{
      const decalType=DecalTypes[type]
      state[decalType.stateProperty]=result
      if(!activeFilterTab[decalType.filterTab]){
        handleActiveFilterTab(decalType.filterTab)
      }

    }
    const readFile=(type)=>{
      reader(file).then((result)=>{
        handleDecals(type,result);
        setActiveEditorTab("")
      })

    }
  return (
    <AnimatePresence>
      {!snap.intro  && <>
      <motion.div key="custom" className=' absolute top-0 left-0 z-10' {...slideAnimation('left')} >
        <div className='flex items-center min-h-screen' >
          <div className='editortabs-container tabs' >
            {EditorTabs.map((item,index)=>(
              <Tab key={item.name} tab={item} handleClick={()=>{setActiveEditorTab(item.name)}} />
            ))}
            {generateTabContent()}

          </div>

        </div>
      </motion.div>
      <motion.div className=' absolute z-10 top-5 right-5' {...fadeAnimation} >
        <CustomButton 
        customStyles="w-fit px-4 py-2.5 font-bold text-sm " 
        type="filled" title="Go back" handleClick={()=>state.intro=true} />

      </motion.div>
      <motion.div  className=' filtertabs-container' {...slideAnimation('up')} >
      {FilterTabs.map((item,index)=>(
              <Tab 
              key={item.name} 
              tab={item}
              isFilterTab
              isActiveTab={activeFilterTab[item.name]} 
              handleClick={()=>{handleActiveFilterTab(item.name)}} />
            ))}
      </motion.div>
      </> }
    </AnimatePresence>
  )
}

export default Customizer