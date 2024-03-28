import React from 'react';
import './app.scss';
import logo from './assets/images/logo.svg'
import arrow from './assets/images/icon-arrow-down.svg'
import playIcon from "./assets/images/icon-play.svg";
import newWindowIcon from "./assets/images/icon-new-window.svg";
import Input from './components/input';


const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

export default function App() {

  const [font, setFont] = React.useState("sans-serif");
  const [value, setValue] = React.useState("keyboard");
  const [theme, setTheme] = React.useState<'light'|'dark'>(prefersDarkMode ? "dark": "light");
  const debouncedValue = useDebounce(value);
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    let theme = localStorage.getItem('theme') as "dark" | "light";
    setTheme( theme ?? (mediaQuery ? 'dark' : 'light'));
    const handleChange = (e: any) => {
      setTheme(e.matches ? 'dark' : 'light');
      localStorage.setItem('theme', e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  React.useLayoutEffect(() => {
    document.body.className = theme;
  }, [theme]);

  React.useEffect(()=>{
    if (debouncedValue) {
      const controller = new AbortController();
      const signal = controller.signal;

      const fetchData = async () => {
        try {
          const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${debouncedValue}`, { signal });
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          const result = await response.json();
          setData(result[0]);
        }catch (err: any) {
          if (err.name !== 'AbortError') {
            setData(null);
          }
        } 
      };
      fetchData();

      return () => {
        controller.abort();
      };
    }else{
      setData(null);
      setError(true);
    }
  },[debouncedValue])

  return (
    <div className={`wrapper ${font}`}>
      <header>
        <img src={logo} alt="dictionary icon" className='logoImg'/>
        <div className='navActions'>
          <FontDropdown
            font={font}
            setFont={setFont}
          />
          <div className='divider'/>
          <ThemeSwitcher 
            setTheme={setTheme}
            theme={theme}
          />
        </div>
      </header>
      <main>
        <Input
          value={value}
          onChange={(e) => {
            if(e.length > 0){
              setError(false);
            }
            setValue(e);
          }}
          onError={error}
        />
        {
          data ? (
            <div className='resultWrapper'>
              <div className='wordDetails'>
                <div className="word">
                  <span className='label'>{data.word}</span>
                  <span className='phonetic'>{data.phonetic}</span>
                </div>
                <div className='player'>
                  <img src={playIcon} alt="" />
                </div>  
              </div>

              <div className='meaningsWrapper'>
                {
                  data.meanings.map((m: any)=>{
                    return (
                      <div key={m.partOfSpeech + m.definitions.length}>
                        <div className='partOfSpeech'>
                          <span>{m.partOfSpeech}</span>
                        </div>
                        <div className='resultsData'>
                          <span>Meaning</span>
                          <div className="meanings">
                            {
                              m.definitions.map((e:any)=>(
                                <div className="meaning" key={e.definition}>
                                  {e.definition}
                                  {e.example && (
                                    <p>“{e.example}”</p>
                                  )}
                                </div>
                              ))
                            }
                          </div>
                          {
                            m.synonyms.length ? (
                              <div className='synonyms'>
                                <span className='label'>Synonyms</span>
                                {
                                  m.synonyms.map((s:any)=>{
                                    return (
                                      <div onClick={()=>setValue(s)} className='synonym' key={s}>
                                        {s}
                                      </div>
                                    )
                                  })
                                }
                              </div>
                            ): null
                          }
                        </div>
                      </div>
                    )
                  })
                }
                <div className='partOfSpeech'></div>
              </div>

              <div className='source'>
                <span>Source</span>
                {
                  data.sourceUrls.map((el:any)=>(
                    <p key={el}>
                      <a href={el} target="_blank">{el}</a>
                      <img src={newWindowIcon} alt="open link in new tab icon" />
                  </p>
                  ))
                }
              </div>
           </div>
          ): (
            value === "" ? null : (
              <div className='emptyState'>
                <span className='emoji'>😕</span>
                <span className='title'>No Definitions Found</span>
                <p>Sorry pal, we couldn't find definitions for the word you were looking for. You can try the search again at later time or head to the web instead.</p>
            </div>
            )
          )
        }
      </main>
    </div>
  );
}

type FontDropdownProps = {
  font: string
  setFont:  React.Dispatch<React.SetStateAction<string>>
}
function FontDropdown(props: FontDropdownProps){
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handleClickOutside = (event: any) => {
      if(dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className='fontDropdown' ref={dropdownRef}>
      <div className='action' onClick={()=> setIsOpen(true)}>
        <span className='label'>{fonts.find(f=> f.value === props.font)!.label}</span>
        <span><img src={arrow} alt="" /></span>
      </div>
      {
        isOpen && (
          <div className='fontMenu'>
            {
              fonts.map(f=>{
                return (
                  <div
                    onClick={(e)=> {
                      e.preventDefault();
                      props.setFont(f.value);
                      setIsOpen(false);
                    }}
                    className={`${f.value} fontLabel`} 
                    key={f.value}
                  >
                    {f.label}
                  </div>
                )
              })
            }
          </div>
        )
      }
    </div>
  )
}

function ThemeSwitcher(props : {setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>, theme: "dark" | "light"}){
  const isDarkMode = props.theme === "dark";
  return (
    <div className='switchWrapper'>
      <div 
        onClick={()=> {
          if(props.theme === "dark"){
            localStorage.setItem('theme', "light");
            props.setTheme("light");
          }else{
            props.setTheme("dark");
            localStorage.setItem('theme', "dark");
          }
        }}
        className={`inputSwitch ${isDarkMode ? "active": "inactive"}`}
      >
        <span className='dotSwitch'></span>
      </div>

        <svg className='moonTheme' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 22 22">
          <path fill="none" stroke="#838383" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 10.449a10.544 10.544 0 0 0 19.993 4.686C11.544 15.135 6.858 10.448 6.858 1A10.545 10.545 0 0 0 1 10.449Z"/>
        </svg>
    </div>
  )
}
function useDebounce(value: string, delay = 100) {
  const [debouncedValue, setDebouncedValue] = React.useState<string>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
const fonts = [
  {
    label: 'Sans Serif',
    value: 'sans-serif'
  },
  {
    label: 'Serif',
    value: 'serif'
  },
  {
    label: 'Mono',
    value: 'mono'
  },
]
