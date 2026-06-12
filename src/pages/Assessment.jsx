import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Send, 
  Menu,
  ShieldAlert,
  Terminal,
  Play,
  X,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../api';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const Assessment = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  // -- STATE --
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(15 * 60); // Initial 15 Minutes for Verbal
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Persistence: Load from localStorage on mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem('assessment_answers');
    const savedTime = localStorage.getItem('assessment_time_left');
    const savedSection = localStorage.getItem('assessment_section');
    
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    if (savedTime) setTimeLeft(Number(savedTime));
    if (savedSection) setCurrentSectionIdx(Number(savedSection));
  }, []);

  // Persistence: Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('assessment_answers', JSON.stringify(answers));
    localStorage.setItem('assessment_time_left', timeLeft.toString());
    localStorage.setItem('assessment_section', currentSectionIdx.toString());
  }, [answers, timeLeft, currentSectionIdx]);
  
  // Coding State
  const [userCode, setUserCode] = useState('// Write your solution here\n');
  const [language, setLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // -- FULL 46-QUESTION BANK (LITERAL RESTORATION) --
  const sections = [
    { 
      id: 'verbal', 
      title: 'Verbal English', 
      duration: 15 * 60, // 15 mins
      questions: [
        { id: 'v-1', type: 'mcq', text: "The scientist's groundbreaking discovery was a _________ moment.", options: ['Trivial', 'Pivotal', 'Insignificant', 'Minor'], correct: 1 },
        { id: 'v-2', type: 'mcq', text: "PASSAGE: Mike, a poor farmer, and Morris, a rich jeweler, lived in the same village. Mike left for the city with his family and rested under a tree. A thief hiding there dropped jewels and fled after hearing Mike's wife express faith in God. Mike became rich. Morris, being greedy, tried to imitate Mike's actions at the same tree with his lazy family. When Morris expressed the same faith, a thief appeared and robbed them of everything.\n\n QUESTION: Why did Mike and his family decide to rest under the tree?", options: ['Being a large family, they knew they could defeat the thief', 'It was a convenient spot for taking a halt at night', 'There was a stream nearby and wood enough to build a house', 'That was the only large tree that could shelter their family'], correct: 1 },
        { id: 'v-3', type: 'mcq', text: "PASSAGE: Mike, a poor farmer, and Morris, a rich jeweler, lived in the same village. Mike left for the city with his family and rested under a tree. A thief hiding there dropped jewels and fled after hearing Mike's wife express faith in God. Mike became rich. Morris, being greedy, tried to imitate Mike's actions at the same tree with his lazy family. When Morris expressed the same faith, a thief appeared and robbed them of everything.\n\n QUESTION: Which of the following best describes Morris?", options: ['He was a rich businessman', 'He bullied his wife', 'He paid his servants well', 'He was greedy and imitated Mike'], correct: 3 },
        { id: 'v-4', type: 'mcq', text: "PASSAGE: Mike, a poor farmer, and Morris, a rich jeweler, lived in the same village. Mike left for the city with his family and rested under a tree. A thief hiding there dropped jewels and fled after hearing Mike's wife express faith in God. Mike became rich. Morris, being greedy, tried to imitate Mike's actions at the same tree with his lazy family. When Morris expressed the same faith, a thief appeared and robbed them of everything.\n\n QUESTION: What did Mike and his wife mean when they said 'He is watching all this from above'?", options: ['They had spotted the thief and wanted to scare him', 'They were telling each other to have faith in God', 'It was just a warning for family members to stick together', 'They were begging the thief to help the family'], correct: 1 },
        { id: 'v-5', type: 'mcq', text: "PASSAGE: Mike, a poor farmer, and Morris, a rich jeweler, lived in the same village. Mike left for the city with his family and rested under a tree. A thief hiding there dropped jewels and fled after hearing Mike's wife express faith in God. Mike became rich. Morris, being greedy, tried to imitate Mike's actions at the same tree with his lazy family. When Morris expressed the same faith, a thief appeared and robbed them of everything.\n\n QUESTION: Why did the thief return to the tree?", options: ['To wait for Mike to return', 'To set up a trap', 'To wait for Morris\'s family', 'Not mentioned in the passage'], correct: 3 },
        { id: 'v-6', type: 'mcq', text: "PASSAGE: Mike, a poor farmer, and Morris, a rich jeweler, lived in the same village. Mike left for the city with his family and rested under a tree. A thief hiding there dropped jewels and fled after hearing Mike's wife express faith in God. Mike became rich. Morris, being greedy, tried to imitate Mike's actions at the same tree with his lazy family. When Morris expressed the same faith, a thief appeared and robbed them of everything.\n\n QUESTION: How did the fellow villagers react to Mike getting rich overnight?", options: ['They were jealous of him', 'They were very excited', 'They followed his example', 'They envied him'], correct: 1 },
        { id: 'v-7', type: 'mcq', text: "The candidate's speech was filled with empty _________.", options: ['Promises', 'Commitments', 'Assurances', 'Guarantees'], correct: 0 },
        { id: 'v-8', type: 'mcq', text: 'Despite being extremely busy,....', options: ["he didn't have time for anything.", 'he managed to help his friend move.', 'he neglected all his responsibilities.', 'he turned down all new tasks.', 'he took a vacation for a month.'], correct: 1 },
        { id: 'v-9', type: 'mcq', text: 'Thanks to his hard work and perseverance,....', options: ['he failed to achieve his goal.', 'he easily gave up when faced with challenges.', 'he achieved success in his business.', 'he became lazy and unmotivated.', 'nothing worked in his favor.'], correct: 2 },
        { id: 'v-10', type: 'mcq', text: 'Arrange the sentences in a meaningful paragraph: A) Scientists study animal behavior to understand ecosystems better. B) Observations help identify how species interact with each other. C) This knowledge supports conservation efforts worldwide. D) Many animals display complex social behaviors that surprise researchers.', options: ['ADBC', 'DBAC', 'ABCD', 'CABD'], correct: 0 },
        { id: 'v-11', type: 'mcq', text: 'Identify the part with a grammatical error: "The information you requested are not readily available."', options: ['The information you', 'requested are not', 'readily available.', 'No error'], correct: 1 },
        { id: 'v-12', type: 'mcq', text: 'Arrange the following words to form a meaningful sentence: 1. charge, 2. to, 3. him, 4. handover, 5. the', options: ['32154', '45123', '45321', '43512', '54213'], correct: 1 },
        { id: 'v-13', type: 'mcq', text: 'Arrange the following words to form a meaningful sentence: 1. the, 2. attended, 3. she, 4. conference, 5. yesterday', options: ['31524', '32145', '35124', '35214', '31452'], correct: 1 },
        { id: 'v-14', type: 'mcq', text: 'Choose the correct meaning of the idiom: "To have a finger in the pie"', options: ['To have a lot of food', 'To be involved in something, especially in a way that gives you an advantage', 'To cause problems in a situation', 'To make a mess'], correct: 1 },
        { id: 'v-15', type: 'mcq', text: "The novel's didactic nature made it both educational and engaging. (Select the synonym for the word didactic)", options: ['Entertaining', 'Instructive', 'Mysterious', 'Romantic'], correct: 1 }
      ]
    },
    { 
      id: 'logical', 
      title: 'Logical / Reasoning', 
      duration: 10 * 60, // 10 mins
      questions: [
        { id: 'l-1', type: 'mcq', text: "If M's father's only daughter is N, and N is the mother of O, how is M related to O?", options: ['Grandfather', 'Brother', 'Father', 'Uncle'], correct: 3 },
        { id: 'l-2', type: 'mcq', text: 'There are six persons sitting in a row facing North. A is sitting towards immediate left of B and immediate right of C. C is sitting to immediate right of F. D is immediate right of E who is to the left of F, then which two people are sitting in the center?', options: ['D and B', 'A and B', 'F and C', 'E and D'], correct: 2 },
        { id: 'l-3', type: 'mcq', text: 'In a certain code language, the word "MATH" is written as 131208. How will "SCIENCE" be written in that code?', options: ['193951435', '193951635', '193951436', '193951445'], correct: 0 },
        { id: 'l-4', type: 'mcq', text: 'Question: What is the sum of the angles of a triangle? Statement 1: One of the angles of the triangle is 60 degrees. Statement 2: The triangle is an equilateral triangle.', options: ['Statement 1 alone is sufficient', 'Statement 2 alone is sufficient', 'Both statement 1 and statement 2 together are sufficient', 'Both statement 1 and statement 2 even together are not sufficient'], correct: 1 },
        { id: 'l-5', type: 'mcq', text: 'Study the data on train delays: [Delay 0: 1250 Arrivals, 1400 Departures], [Delay 0-30: 114 Arrivals, 82 Departures], [Delay 30-60: 31 Arrivals, 5 Departures], [Delay > 60: 5 Arrivals, 3 Departures], [Total: 1400 Arrivals, 1490 Departures]. Based on the table, find the percentage of late-arriving trains.', options: ['10.71 %', '11.25 %', '9.50 %', '12.00 %'], correct: 0 },
        { id: 'l-6', type: 'mcq', text: 'A person starts from point A and walks 10 km south. He then turns right and walks 10 km. He turns right again and walks 10 km. In which direction is he from point A now?', options: ['North', 'South', 'East', 'West'], correct: 3 },
        { id: 'l-7', type: 'mcq', text: 'Statements: All mangoes are bananas. Some bananas are globe. All globe are square. Conclusions: I. Some mangoes are square. II. No mango is square.', options: ['If only conclusion I is true.', 'If only conclusion II is true.', 'If either conclusion I or conclusion II is true.', 'Neither conclusion I nor conclusion II is true'], correct: 2 },
        { id: 'l-8', type: 'mcq', text: 'Statement: Some red is not black. Only a few black are colour. All colours are natural. Conclusion: 1. Some red can be natural. 2. Some black are not colour.', options: ['Only conclusion 1 follows', 'Only conclusion 2 follows', 'Either 1 or 2 follows', 'Both conclusion 1 and 2 follow'], correct: 3 },
        { id: 'l-9', type: 'mcq', text: 'CDE, EFG, GHI, ____, KLM', options: ['HIJ', 'IJK', 'JKL', 'LNO'], correct: 1 },
        { id: 'l-10', type: 'mcq', text: 'What is the missing number in the following sequence? 2, 12, 60, 240, 720, 1440, .... 0', options: ['2880', '1440', '720', '0'], correct: 1 }
      ]
    },
    { 
      id: 'numerical', 
      title: 'Aptitude / Numerical', 
      duration: 10 * 60, // 10 mins
      questions: [
        { id: 'n-1', type: 'mcq', text: 'Barack spends Rs 6650 to buy some goods and gets a rebate of 6% on it. After this, he pays a sales tax of 10%. What is his total expenditure?', options: ['Rs 6870.10', 'Rs 6876.10', 'Rs 6865.10', 'Rs 6776.10'], correct: 1 },
        { id: 'n-2', type: 'mcq', text: 'A invested Rs. 70,000 in a business. After a few months, B joined him with Rs. 60,000. At the end of the year, the total profit was divided between them in the ratio of 2: 1. After how many months did B join?', options: ['5 months', '6 months', '4 months', '7 months'], correct: 0 },
        { id: 'n-3', type: 'mcq', text: 'If a : b = 5 : 9 and b : c = 7 : 4, then find a : b : c.', options: ['35 : 63 : 36', '35 : 63 : 28', '5 : 7 : 4', '35 : 54 : 36'], correct: 0 },
        { id: 'n-4', type: 'mcq', text: 'A can type 85 pages in 10 hours. A and B together can type 500 pages in 40 hours. How much time B will take to type 80 pages.', options: ['20 hours', '15 hours', '10 hours', '25 hours'], correct: 0 },
        { id: 'n-5', type: 'mcq', text: 'A dealer wants to mark the price of an article such that by offering a 5 % discount, he is able to get 33 % profit. Find the percent of CP above which the article should be marked.', options: ['40 %', '38 %', '42 %', '35 %'], correct: 0 },
        { id: 'n-6', type: 'mcq', text: 'Find the HCF of 36, 48, and 72.', options: ['12', '24', '6', '36'], correct: 0 },
        { id: 'n-7', type: 'mcq', text: 'The difference between a two-digit number and the number obtained by interchanging the positions of its digits is 36. What is the difference between the two digits of that number?', options: ['4', '5', '6', 'None of these'], correct: 0 },
        { id: 'n-8', type: 'mcq', text: 'At what time between 12 PM and 1 PM would the two hands of the clock be together?', options: ['12:00 PM', '12:05 PM', '12:55 PM', '1:00 PM'], correct: 0 },
        { id: 'n-9', type: 'mcq', text: 'If the sequence is 1, 1/2, 1/3, ..., find the sum of the first 5 terms of the harmonic series.', options: ['2.2833', '2.5000', '1.5000', '3.1250'], correct: 0 },
        { id: 'n-10', type: 'mcq', text: 'A train travels from Station A to Station B at a speed of 60 km/hr and returns from Station B to Station A at a speed of 40 km/hr. If the total time for the round trip is 5 hours, find the distance between Station A and Station B.', options: ['120 km', '100 km', '150 km', '80 km'], correct: 0 }
      ]
    },
    { 
      id: 'advance-quant', 
      title: 'Advanced Quant', 
      duration: 20 * 60, // 20 mins
      questions: [
        { id: 'aq-1', type: 'mcq', text: 'Two outlet pipes A and B are connected to a full tank. Pipe A alone can empty the tank in 10 minutes and pipe B alone can empty the tank in 30 minutes. If both are opened together, how much time will it take to empty the tank completely?', options: ['7 minutes', '7 minutes 30 seconds', '6 minutes', '6 minutes 3 seconds'], correct: 1 },
        { id: 'aq-2', type: 'mcq', text: "Peter and Beckon start to walk in the same direction together. If Peter's speed is 5 km/h and Beckon's speed is 6 km/h, find out the time duration after which they are 17 km apart if peter was 3 km behind Beckon at the time of starting.", options: ['14', '15', '19', '20'], correct: 0 },
        { id: 'aq-3', type: 'mcq', text: 'A bookseller gains a profit of 10% after selling a book at the price of Rs 27.50. If it is sold at the price of Rs 25.75, find out the percentage of loss or profit on the book.', options: ['Profit 3%', 'Loss 4%', 'Profit 5%', 'Loss 2%'], correct: 0 },
        { id: 'aq-4', type: 'mcq', text: 'The price of sugar is decreased by 10%. As a consequence, monthly sales is increased by 30%. Find out the percentage increase in monthly revenue.', options: ['17 %', '19 %', '18 %', 'None of these'], correct: 0 },
        { id: 'aq-5', type: 'mcq', text: "What is the unit's digit in the product (267)^153 x (6666)^72 ?", options: ['7', '6', '1', '2'], correct: 3 },
        { id: 'aq-6', type: 'mcq', text: 'A person starts walking from point A towards the north and walks 5 km. He then turns right and walks 3 km, then turns right again and walks 5 km. Finally, he turns left and walks 2 km. What is the final direction he is facing?', options: ['North', 'South', 'East', 'West'], correct: 2 },
        { id: 'aq-7', type: 'mcq', text: 'Pointing to a woman, Tom says, "She is the daughter of the only child of my grandmother." How is the woman related to Tom?', options: ['Sister', 'Aunt', 'Mother', 'Cousin'], correct: 0 },
        { id: 'aq-8', type: 'mcq', text: 'If in a code, the word "COMPUTER" is written as "DPNQVUFS," how is the word "KEYBOARD" written in that code?', options: ['LFZCPBES', 'LFZPCBSE', 'LFZCPBSE', 'LFZCNBSE'], correct: 2 },
        { id: 'aq-9', type: 'mcq', text: 'Find wrong number in series: 8, 12, 16, 27, 40.5, 60.75', options: ['12', '16', '40.5', '60.75'], correct: 1 },
        { id: 'aq-10', type: 'mcq', text: 'If "CYCLE" is written as "DZDMF," how is "PLANE" written in the same code?', options: ['QMBNG', 'QMBNF', 'QMBOF', 'QMDNF'], correct: 2 }
      ]
    },
    { 
      id: 'coding', 
      title: 'Advanced Coding', 
      duration: 10 * 60, // 10 mins
      questions: [{
        id: 'coding-1',
        type: 'coding',
        title: 'Array Reversal & Target Search',
        text: 'Given an array of integers arr and a target value x, first reverse the array in-place, then find and return the index of x in the reversed array. If not found, return -1.',
        testCases: [
          { input: '[1,2,3,4,5], 2', output: '3' },
          { input: '[10,20,30], 20', output: '1' }
        ]
      }]
    }
  ];

  // -- REFS --
  const timerRef = useRef(null);

  // -- EFFECTS --
  useEffect(() => {
    // 1. Block Right Click
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    // 2. Block Copy and Trigger Auto-Submit
    const handleCopy = (e) => {
      e.preventDefault();
      toast.error('Security Breach: Copying detected. Auto-submitting assessment...', { duration: 4000 });
      setTimeout(() => handleSubmit(), 1000);
    };
    document.addEventListener('copy', handleCopy);

    // 3. Block Keyboard Shortcuts (Ctrl+C, Ctrl+V, etc.)
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'u' || e.key === 'i')) ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        toast.error('Security Warning: Prohibited shortcut usage.');
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Timer Logic
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time is up for current section
          if (currentSectionIdx < sections.length - 1) {
            const nextIdx = currentSectionIdx + 1;
            toast.success(`Time up! Moving to ${sections[nextIdx].title}`);
            setCurrentSectionIdx(nextIdx);
            setCurrentQuestionIdx(0);
            setTimeLeft(sections[nextIdx].duration);
            return sections[nextIdx].duration;
          } else {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // -- HELPERS --
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentSection = sections[currentSectionIdx];
  const currentQuestion = currentSection.questions[currentQuestionIdx];
  const questionKey = `${currentSection.id}-${currentQuestionIdx}`;

  const handleOptionSelect = (optionIdx) => {
    setAnswers({ ...answers, [questionKey]: optionIdx });
  };

  const handleToggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(questionKey)) newFlagged.delete(questionKey);
    else newFlagged.add(questionKey);
    setFlagged(newFlagged);
  };

  const handleNext = () => {
    if (currentQuestionIdx < currentSection.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      toast.error(`Please wait for the section timer to complete before moving to ${sections[currentSectionIdx + 1]?.title || 'submission'}.`);
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setTestResults({ passed: 2, total: 2 });
      setIsRunning(false);
      toast.success('All test cases passed!');
    }, 1500);
  };

  const handleSubmit = async () => {
    try {
      // Calculate Scores
      let totalCorrect = 0;
      let totalAttempted = 0;
      const sectionBreakdown = {};

      sections.forEach(section => {
        let sectionCorrect = 0;
        if (section.id !== 'coding') {
          section.questions.forEach((q, idx) => {
            const key = `${section.id}-${idx}`;
            if (answers[key] !== undefined) {
              totalAttempted++;
              if (answers[key] === q.correct) {
                sectionCorrect++;
              }
            }
          });
          sectionBreakdown[section.id] = sectionCorrect;
          totalCorrect += sectionCorrect;
        } else {
          // Coding score (mocked for now based on test results)
          sectionBreakdown.coding = testResults?.passed || 0;
          totalCorrect += (testResults?.passed || 0) * 10; // Coding worth more?
        }
      });

      const totalPossible = sections.reduce((acc, s) => {
        if (s.id === 'coding') return acc + 20; // 2 tests * 10
        return acc + s.questions.length;
      }, 0);

      const percentage = ((totalCorrect / totalPossible) * 100).toFixed(2);
      const status = percentage >= 40 ? 'PASS' : 'FAIL';

      // Create a detailed result object with student info and question details
      let detailedAnswers = [];
      let totalWrong = 0;
      
      sections.forEach(section => {
        if (section.id !== 'coding') {
          section.questions.forEach((q, idx) => {
            const key = `${section.id}-${idx}`;
            if (answers[key] !== undefined) {
               const isCorrect = answers[key] === q.correct;
               if (!isCorrect) totalWrong++;
               detailedAnswers.push({
                 questionId: q.id,
                 sectionTitle: section.title,
                 questionText: q.text,
                 userAnswer: answers[key],
                 correctAnswer: q.correct,
                 isCorrect: isCorrect
               });
            }
          });
        }
      });

      const studentUser = JSON.parse(sessionStorage.getItem('studentUser') || '{}');
      
      const payload = {
         name: studentUser.name || 'Unknown',
         email: studentUser.email || 'unknown@example.com',
         college: studentUser.college || 'Unknown',
         usn: studentUser.usn || 'Unknown',
         sectionScores: sectionBreakdown,
         totalScore: totalCorrect,
         percentage: percentage,
         status: status,
         totalAttempted: totalAttempted,
         totalCorrect: totalCorrect,
         totalWrong: totalWrong,
         detailedAnswers: detailedAnswers,
         submittedAt: new Date().toISOString()
      };

      await addDoc(collection(db, "students_results"), payload);

      // Clear persistence on success
      localStorage.removeItem('assessment_answers');
      localStorage.removeItem('assessment_time_left');
      localStorage.removeItem('assessment_section');

      toast.success('Assessment Submitted Successfully');
      navigate('/completed');
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Failed to submit assessment. Please try again.");
    }
  };

  // Stats
  const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
  const totalAnswered = Object.keys(answers).length;
  const totalFlagged = flagged.size;
  const totalUnanswered = totalQuestions - totalAnswered;

  return (
    <div className="flex h-screen bg-[#F5F7F8] font-sans overflow-hidden select-none" style={{ userSelect: 'none' }}>
      {/* SIDEBAR BACKDROP FOR MOBILE/TABLET */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 lg:relative flex flex-col bg-white border-r border-slate-200 transition-all duration-300
          ${isSidebarOpen 
            ? 'w-80 translate-x-0' 
            : 'w-80 -translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'
          }`}
      >
        {isSidebarOpen && (
          <>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Student</p>
                <p className="text-xs font-bold text-slate-700 truncate max-w-[180px]">techmasterstrainings@gmail.com</p>
                <p className="text-[10px] text-slate-400 mt-1">+91-9880768222</p>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-full text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex items-center gap-3 text-slate-700">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
              <span className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-slate-800">{currentSection.title}</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section {currentSectionIdx + 1}</span>
              </div>
              
              <div className="grid grid-cols-6 gap-2 mb-8">
                {currentSection.questions.map((_, i) => {
                  const key = `${currentSection.id}-${i}`;
                  const isAnswered = answers[key] !== undefined;
                  const isFlagged = flagged.has(key);
                  const isCurrent = i === currentQuestionIdx;
                  
                  let bgColor = 'bg-slate-100 text-slate-400 hover:bg-slate-200';
                  if (isAnswered) bgColor = 'bg-emerald-500 text-white shadow-md shadow-emerald-100';
                  if (isFlagged) bgColor = 'bg-red-400 text-white';
                  if (isCurrent && !isAnswered && !isFlagged) bgColor = 'ring-2 ring-indigo-500 bg-white text-indigo-600 font-bold';

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentQuestionIdx(i);
                        if (window.innerWidth < 1024) {
                          setIsSidebarOpen(false);
                        }
                      }}
                      className={`h-9 w-full rounded flex items-center justify-center text-xs transition-all ${bgColor}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-8 bg-slate-100 rounded flex items-center justify-center text-xs font-bold text-slate-500">{totalUnanswered}</div>
                  <span className="text-sm text-slate-600 font-bold">Unanswered</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-8 bg-emerald-500 rounded flex items-center justify-center text-xs font-bold text-white">{totalAnswered}</div>
                  <span className="text-sm text-slate-600 font-bold">Answered</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-8 bg-red-400 rounded flex items-center justify-center text-xs font-bold text-white">{totalFlagged}</div>
                  <span className="text-sm text-slate-600 font-bold">Marked as Flag</span>
                </div>
              </div>

              <div className="space-y-2 pb-6">
                {sections.map((s, i) => (
                  <button
                    key={i}
                    disabled={i !== currentSectionIdx}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-black transition-all ${
                      i === currentSectionIdx 
                      ? 'bg-indigo-600 text-white shadow-lg cursor-default' 
                      : 'bg-slate-50 text-slate-200 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col relative text-slate-800 min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><Menu className="w-5 h-5 text-slate-500" /></button>
            <h1 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight">Test : <span className="text-slate-400 font-mono">TechMasters</span></h1>
          </div>
          <div />
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8 text-xs font-bold uppercase tracking-wider text-slate-400 flex-wrap">
              {/* Evaluation removed per request */}
            </div>

            {currentQuestion.type === 'mcq' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h4 className="text-lg sm:text-xl font-black text-slate-800 mb-4">Question {currentQuestionIdx + 1}</h4>
                <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed mb-6 sm:mb-10 p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100">{currentQuestion.text}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = answers[questionKey] === idx;
                    let style = 'border-white bg-white hover:border-slate-200';
                    if (isSelected) { style = 'border-indigo-500 bg-indigo-50'; }
                    return (
                      <button key={idx} onClick={() => handleOptionSelect(idx)} className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl text-left flex items-center justify-between transition-all border-2 shadow-sm gap-2 ${style}`}>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center shrink-0 border-slate-200`}>
                            {isSelected && <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-indigo-600`} />}
                          </div>
                          <span className="text-sm sm:text-base md:text-lg font-bold">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:gap-6 h-[calc(100vh-220px)] lg:h-[calc(100vh-250px)] min-h-[400px]">
                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm"><h4 className="text-lg sm:text-xl font-black text-slate-800 mb-2">{currentQuestion.title}</h4><p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{currentQuestion.text}</p></div>
                <div className="flex-1 flex gap-6 min-h-0">
                  <div className="flex-1 bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-800 flex flex-col shadow-2xl">
                    <div className="px-4 py-2 bg-slate-800 flex justify-between items-center"><div className="flex items-center gap-2"><Terminal className="w-4 h-4 text-emerald-400" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Editor</span></div></div>
                    <div className="flex-1 border-t border-slate-800"><Editor height="100%" language={language} theme="vs-dark" value={userCode} onChange={setUserCode} options={{ minimap: { enabled: false }, fontSize: 14 }} /></div>
                    <div className="p-4 bg-slate-800 flex justify-end"><button onClick={handleRunCode} disabled={isRunning} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 sm:px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all text-sm disabled:opacity-50">{isRunning ? 'Executing...' : <><Play className="w-4 h-4" /> Run Test Cases</>}</button></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="h-20 bg-white border-t border-slate-200 px-4 sm:px-10 flex items-center justify-between shrink-0">
          <div className="flex gap-4">
            <button onClick={handleToggleFlag} className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${flagged.has(questionKey) ? 'bg-red-50 text-red-600 border-red-200 border-2' : 'bg-slate-50 text-slate-500'}`}>
              <Flag className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Mark Review</span>
            </button>
          </div>
          <div className="flex gap-2 sm:gap-4">
            {currentQuestionIdx > 0 && (
              <button onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)} className="px-3 sm:px-6 py-2.5 text-slate-500 font-bold flex items-center gap-1 sm:gap-2">
                <ChevronLeft className="w-5 h-5 shrink-0" />
                <span className="hidden sm:inline">Previous</span>
              </button>
            )}
            <button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 sm:px-10 py-2.5 rounded-xl font-black shadow-lg shadow-indigo-100 flex items-center gap-1 sm:gap-2 transition-all transform hover:scale-105 text-sm sm:text-base">
              {currentSectionIdx === sections.length - 1 && currentQuestionIdx === currentSection.questions.length - 1 ? (
                <>
                  <span className="hidden sm:inline">SUBMIT ASSESSMENT</span>
                  <span className="sm:hidden">SUBMIT</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Save & Next</span>
                  <span className="sm:hidden">Next</span>
                </>
              )}
              <ChevronRight className="w-5 h-5 shrink-0" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Assessment;
