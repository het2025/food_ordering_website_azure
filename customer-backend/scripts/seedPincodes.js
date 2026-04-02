import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pincode from '../models/Pincode.js';

dotenv.config();

const rawData = `Abhol	391421	Gujarat	Vadodara
Achisara	391111	Gujarat	Vadodara
Adiran	391510	Gujarat	Vadodara
Agar	391150	Gujarat	Vadodara
Ajod	391740	Gujarat	Vadodara
Ajwa Compound	391510	Gujarat	Vadodara
Ajwa Road	390019	Gujarat	Vadodara
Akakheda	391145	Gujarat	Vadodara
Akona	391150	Gujarat	Vadodara
Akota	390020	Gujarat	Vadodara
Alhadpura	391135	Gujarat	Vadodara
Alkapuri	390007	Gujarat	Vadodara
Alva	391760	Gujarat	Vadodara
Amaliyara	390022	Gujarat	Vadodara
Ambada	391445	Gujarat	Vadodara
Ambadungar	391175	Gujarat	Vadodara
Ambala	391165	Gujarat	Vadodara
Ambali	391760	Gujarat	Vadodara
Ambapura	391145	Gujarat	Vadodara
Amla	391445	Gujarat	Vadodara
Amodar	390019	Gujarat	Vadodara
Ampad	391101	Gujarat	Vadodara
Amreshwar	391761	Gujarat	Vadodara
Amroli	391150	Gujarat	Vadodara
Anandi	391111	Gujarat	Vadodara
Anandpura	391761	Gujarat	Vadodara
Anastu	391240	Gujarat	Vadodara
Angadh	391330	Gujarat	Vadodara
Anguthan	391107	Gujarat	Vadodara
Aniyadri	391160	Gujarat	Vadodara
Anjesar	391775	Gujarat	Vadodara
Ankhol	390019	Gujarat	Vadodara
Ankodia	391330	Gujarat	Vadodara
Anti	391445	Gujarat	Vadodara
Antoli	391761	Gujarat	Vadodara
Asar	391168	Gujarat	Vadodara
Asoj	391510	Gujarat	Vadodara
Atali	391244	Gujarat	Vadodara
Athadungri	391170	Gujarat	Vadodara
Athavali	391140	Gujarat	Vadodara
Atladara	390012	Gujarat	Vadodara
Bachar	391244	Gujarat	Vadodara
Bahadarpur	391125	Gujarat	Vadodara
Bahutha	391775	Gujarat	Vadodara
Bajwa	391310	Gujarat	Vadodara
Bakrol	390019	Gujarat	Vadodara
Baman Gam	391210	Gujarat	Vadodara
Bamroli	391125	Gujarat	Vadodara
Bangapura	391145	Gujarat	Vadodara
Bar	391160	Gujarat	Vadodara
Baranpura	390001	Gujarat	Vadodara
Baravad	391160	Gujarat	Vadodara
Barkal	391105	Gujarat	Vadodara
Baroli	391150	Gujarat	Vadodara
Bedia	391165	Gujarat	Vadodara
Bhadara	391445	Gujarat	Vadodara
Bhadarwa	391780	Gujarat	Vadodara
Bhaily	391410	Gujarat	Vadodara
Bhaka	391152	Gujarat	Vadodara
Bhalod	393105	Gujarat	Vadodara
Bhaniara	391510	Gujarat	Vadodara
Bhanpur	391160	Gujarat	Vadodara
Bharthana	391244	Gujarat	Vadodara
Bharvada	391150	Gujarat	Vadodara
Bhatpur	391130	Gujarat	Vadodara
Bhensavali	391160	Gujarat	Vadodara
Bhikhapur	391160	Gujarat	Vadodara
Bhilapur	391107	Gujarat	Vadodara
Bhilodia	391110	Gujarat	Vadodara
Bhilpur	391160	Gujarat	Vadodara
Bhindol	391135	Gujarat	Vadodara
Bhoj	391445	Gujarat	Vadodara
Bhorda	391165	Gujarat	Vadodara
Bhumaswada	391165	Gujarat	Vadodara
Bill	391410	Gujarat	Vadodara
Bithli	391105	Gujarat	Vadodara
Bodeli	391135	Gujarat	Vadodara
Bodka	391240	Gujarat	Vadodara
Borbar	391107	Gujarat	Vadodara
Bordha	391135	Gujarat	Vadodara
Bortalav	391145	Gujarat	Vadodara
Brahamanvashi	391421	Gujarat	Vadodara
Chalamali	391140	Gujarat	Vadodara
Chametha	391150	Gujarat	Vadodara
Champaner Road	391510	Gujarat	Vadodara
Chandod	391105	Gujarat	Vadodara
Chandranagar	391520	Gujarat	Vadodara
Chansad	391440	Gujarat	Vadodara
Chanvada	391110	Gujarat	Vadodara
Chapad	391410	Gujarat	Vadodara
Chemical Industries	390003	Gujarat	Vadodara
Chhaliar	391530	Gujarat	Vadodara
Chhanbhoi	391111	Gujarat	Vadodara
Chhanchava	391244	Gujarat	Vadodara
Chhani	391740	Gujarat	Vadodara
Chhani Rd	390002	Gujarat	Vadodara
Chhatral	391210	Gujarat	Vadodara
Chhatrali	391135	Gujarat	Vadodara
Chhota-udepur	391165	Gujarat	Vadodara
Chhuchhapura	391125	Gujarat	Vadodara
Chikhodara	390009	Gujarat	Vadodara
Chipad	391760	Gujarat	Vadodara
Chisadiya	391165	Gujarat	Vadodara
Chitral	391430	Gujarat	Vadodara
Chokari	391450	Gujarat	Vadodara
Choranda	391244	Gujarat	Vadodara
Chorbhuj	391240	Gujarat	Vadodara
Chorngala	391130	Gujarat	Vadodara
Chudel	391160	Gujarat	Vadodara
Dabhasa	391440	Gujarat	Vadodara
Dabhoi	391110	Gujarat	Vadodara
Dabhoi R.s.	391110	Gujarat	Vadodara
Dabhoi Vadodari bhagol	391110	Gujarat	Vadodara
Dabka	391440	Gujarat	Vadodara
Dajipura	391774	Gujarat	Vadodara
Dani	391152	Gujarat	Vadodara
Danteshwar	390004	Gujarat	Vadodara
Darapura	391440	Gujarat	Vadodara
Dashrath	391740	Gujarat	Vadodara
Dena	390022	Gujarat	Vadodara
Deroli	391130	Gujarat	Vadodara
Desar	391774	Gujarat	Vadodara
Devalia	391160	Gujarat	Vadodara
Dhamasiya	391150	Gujarat	Vadodara
Dhandhoda	391165	Gujarat	Vadodara
Dhaniavi	390014	Gujarat	Vadodara
Dhanora	391510	Gujarat	Vadodara
Dhantej	391530	Gujarat	Vadodara
Dharmpuri	391110	Gujarat	Vadodara
Dhavat	391210	Gujarat	Vadodara
Dholar	391107	Gujarat	Vadodara
Dholi Simal	391165	Gujarat	Vadodara
Dodka	391340	Gujarat	Vadodara
Dolaria	391165	Gujarat	Vadodara
Dormar	391125	Gujarat	Vadodara
Dudhwada	391450	Gujarat	Vadodara
Dugdha	391150	Gujarat	Vadodara
Dumad	391740	Gujarat	Vadodara
Dumali	391160	Gujarat	Vadodara
Dungargam	391165	Gujarat	Vadodara
Dungarvant	391160	Gujarat	Vadodara
Ekalbara	391165	Gujarat	Vadodara
Ekelbara	391440	Gujarat	Vadodara
Eme	390008	Gujarat	Vadodara
Falod	391760	Gujarat	Vadodara
Fanta	391125	Gujarat	Vadodara
Fartikui	391107	Gujarat	Vadodara
Fartilizer Nagar	391750	Gujarat	Vadodara
Fateganj	390002	Gujarat	Vadodara
Fatepura	390006	Gujarat	Vadodara
Fazalpur	391340	Gujarat	Vadodara
Ferkuva	391135	Gujarat	Vadodara
Gabhirpura	391761	Gujarat	Vadodara
Gadhboriad	391152	Gujarat	Vadodara
Gametha	391430	Gujarat	Vadodara
Gandhara	391210	Gujarat	Vadodara
Ganeshpura	391510	Gujarat	Vadodara
Gangadia	391520	Gujarat	Vadodara
Ganpatpura	391760	Gujarat	Vadodara
Garda	391145	Gujarat	Vadodara
Gardhia	391520	Gujarat	Vadodara
Gavasad	391430	Gujarat	Vadodara
Geb	390007	Gujarat	Vadodara
Ghantiyal	391510	Gujarat	Vadodara
Ghantoli	391150	Gujarat	Vadodara
Ghayaj	391440	Gujarat	Vadodara
Ghelawant	391165	Gujarat	Vadodara
Ghodadara	391760	Gujarat	Vadodara
Gola Gamdi	391125	Gujarat	Vadodara
Goraj	391761	Gujarat	Vadodara
Goriyad	391440	Gujarat	Vadodara
Gorwa	390003	Gujarat	Vadodara
Gosindra	391240	Gujarat	Vadodara
Gothda	391770	Gujarat	Vadodara
Gotri	390021	Gujarat	Vadodara
Goyawant	391150	Gujarat	Vadodara
Gundicha	391145	Gujarat	Vadodara
Gutal	391760	Gujarat	Vadodara
Handod	391145	Gujarat	Vadodara
Harakhapur	391160	Gujarat	Vadodara
Hareshwar	391125	Gujarat	Vadodara
Haripura	391150	Gujarat	Vadodara
Harni	390022	Gujarat	Vadodara
Harni Colony	390022	Gujarat	Vadodara
Himmatpura	391774	Gujarat	Vadodara
Husepura	391445	Gujarat	Vadodara
Indrad	391510	Gujarat	Vadodara
Indral	391130	Gujarat	Vadodara
Industrial Estate	390016	Gujarat	Vadodara
Itola	391240	Gujarat	Vadodara
Itola R.s.	391240	Gujarat	Vadodara
Itwad	391774	Gujarat	Vadodara
Jabugam	391155	Gujarat	Vadodara
Jakshi	391150	Gujarat	Vadodara
Jalalpura	391430	Gujarat	Vadodara
Jaloda	391160	Gujarat	Vadodara
Jamba	391160	Gujarat	Vadodara
Jambugoral	391774	Gujarat	Vadodara
Jambuva	390014	Gujarat	Vadodara
Jamli	391152	Gujarat	Vadodara
Jarod	391510	Gujarat	Vadodara
Jaspura	391440	Gujarat	Vadodara
Jawahar Nagar	391320	Gujarat	Vadodara
Jemalgadh	391150	Gujarat	Vadodara
Jiyatalavdi	391220	Gujarat	Vadodara
Jojwa r.s.	391125	Gujarat	Vadodara
Juna Samlaya	391520	Gujarat	Vadodara
Junarampura	391760	Gujarat	Vadodara
Juni Jathardi	391240	Gujarat	Vadodara
Kadachhala	391140	Gujarat	Vadodara
Kadadhara	391107	Gujarat	Vadodara
Kadchhala	391774	Gujarat	Vadodara
Kadipani	391175	Gujarat	Vadodara
Kadvad	391160	Gujarat	Vadodara
Kahndia	391761	Gujarat	Vadodara
Kalali	390012	Gujarat	Vadodara
Kalarani	391135	Gujarat	Vadodara
Kaledia	391150	Gujarat	Vadodara
Kalidoli	391140	Gujarat	Vadodara
Kaliyapura	391150	Gujarat	Vadodara
Kamalpura	391520	Gujarat	Vadodara
Kamrol	391510	Gujarat	Vadodara
Kanalva	391168	Gujarat	Vadodara
Kanbha	391240	Gujarat	Vadodara
Kanbola	391240	Gujarat	Vadodara
Kanda	391160	Gujarat	Vadodara
Kandari	391210	Gujarat	Vadodara
Kanteshwar	391125	Gujarat	Vadodara
Kapurai	390004	Gujarat	Vadodara
Karali	391135	Gujarat	Vadodara
Karalipura	391110	Gujarat	Vadodara
Karamdi	391240	Gujarat	Vadodara
Karanjwant	391165	Gujarat	Vadodara
Karchia	391520	Gujarat	Vadodara
Karchiya	391310	Gujarat	Vadodara
Karelibaug	390018	Gujarat	Vadodara
Karkhadi	391450	Gujarat	Vadodara
Karmal	391210	Gujarat	Vadodara
Karmaliyapura	391761	Gujarat	Vadodara
Karnali	391105	Gujarat	Vadodara
Karnet	391110	Gujarat	Vadodara
Karodia	391310	Gujarat	Vadodara
Kasumbia	391761	Gujarat	Vadodara
Kavitha	391125	Gujarat	Vadodara
Kawant	391170	Gujarat	Vadodara
Kayavahron	391220	Gujarat	Vadodara
Kelanpur	390004	Gujarat	Vadodara
Khadkhad	391165	Gujarat	Vadodara
Khakharia	391510	Gujarat	Vadodara
Khanda	391760	Gujarat	Vadodara
Khanderao Market	390001	Gujarat	Vadodara
Khapariya	391150	Gujarat	Vadodara
Kharmada	391152	Gujarat	Vadodara
Khatiawant	391135	Gujarat	Vadodara
Kheda Karmasiya	391510	Gujarat	Vadodara
Khervadi	391761	Gujarat	Vadodara
Khunvad	391130	Gujarat	Vadodara
Kikavada	391160	Gujarat	Vadodara
Kiya	392310	Gujarat	Vadodara
Kohivav	391160	Gujarat	Vadodara
Kolamba	391152	Gujarat	Vadodara
Kosindra	391140	Gujarat	Vadodara
Kotambi	391510	Gujarat	Vadodara
Kotna	391330	Gujarat	Vadodara
Koyali	391330	Gujarat	Vadodara
Kukad	391110	Gujarat	Vadodara
Kukarda	391150	Gujarat	Vadodara
Kumetha	390019	Gujarat	Vadodara
Kundal	391165	Gujarat	Vadodara
Kundhela	391107	Gujarat	Vadodara
Kurai	391240	Gujarat	Vadodara
Kural	391430	Gujarat	Vadodara
Kurali	391240	Gujarat	Vadodara
Kuvarpura	391761	Gujarat	Vadodara
Kuvarvada	391760	Gujarat	Vadodara
Lachharas	391130	Gujarat	Vadodara
Ladod	391135	Gujarat	Vadodara
Lakodara	391244	Gujarat	Vadodara
Lamdapura	391775	Gujarat	Vadodara
Lanchanpura	391770	Gujarat	Vadodara
Latipura	391440	Gujarat	Vadodara
Latwa	391530	Gujarat	Vadodara
Lavakui	391150	Gujarat	Vadodara
Lilora	391510	Gujarat	Vadodara
Limda	391760	Gujarat	Vadodara
Limdi	391530	Gujarat	Vadodara
Lingsthali	391220	Gujarat	Vadodara
Lotia	391125	Gujarat	Vadodara
Luna	391440	Gujarat	Vadodara
M.I. estate	390010	Gujarat	Vadodara
Madanzampa	390001	Gujarat	Vadodara
Madheli	391760	Gujarat	Vadodara
Mahmadpura	391440	Gujarat	Vadodara
Mahuvad	391440	Gujarat	Vadodara
Majatan	391450	Gujarat	Vadodara
Makarpura	390014	Gujarat	Vadodara
Makni	391145	Gujarat	Vadodara
Malpur	391145	Gujarat	Vadodara
Malu	391761	Gujarat	Vadodara
Manavant	391168	Gujarat	Vadodara
Mandala	391210	Gujarat	Vadodara
Mandlava	391165	Gujarat	Vadodara
Mandva	391105	Gujarat	Vadodara
Mandvi	390001	Gujarat	Vadodara
Maneja	390013	Gujarat	Vadodara
Manglej	391210	Gujarat	Vadodara
Manjalpur	390011	Gujarat	Vadodara
Manjrol	391110	Gujarat	Vadodara
Manjusar	391775	Gujarat	Vadodara
Manka	391170	Gujarat	Vadodara
Mankodi	391170	Gujarat	Vadodara
Manpur	391240	Gujarat	Vadodara
Masar	391421	Gujarat	Vadodara
Masar Road	391421	Gujarat	Vadodara
Meghakui	391107	Gujarat	Vadodara
Menpura	391220	Gujarat	Vadodara
Merakuva	391774	Gujarat	Vadodara
Methi	391240	Gujarat	Vadodara
Mevli	391770	Gujarat	Vadodara
Mithibor	391165	Gujarat	Vadodara
Miyagam	391240	Gujarat	Vadodara
Miyagam Karjan	391240	Gujarat	Vadodara
Mobha	391430	Gujarat	Vadodara
Mobha Road	391430	Gujarat	Vadodara
Modasar	391135	Gujarat	Vadodara
Moghela	391152	Gujarat	Vadodara
Mokshi	391780	Gujarat	Vadodara
Moletha	391105	Gujarat	Vadodara
Moradungari	391140	Gujarat	Vadodara
Morakhala	391125	Gujarat	Vadodara
Morangana	391168	Gujarat	Vadodara
Mota habipura	391111	Gujarat	Vadodara
Mota Karala	391105	Gujarat	Vadodara
Motaghoda	391165	Gujarat	Vadodara
Motavanta	391170	Gujarat	Vadodara
Moti amroli	391160	Gujarat	Vadodara
Moti beg	391160	Gujarat	Vadodara
Moti rasli	391160	Gujarat	Vadodara
Motibumadi	391155	Gujarat	Vadodara
Motimanekpur	391761	Gujarat	Vadodara
Motipura	391520	Gujarat	Vadodara
Motivarnoli	391774	Gujarat	Vadodara
Mudhela	391510	Gujarat	Vadodara
Mujpur	391440	Gujarat	Vadodara
Muldhar	391155	Gujarat	Vadodara
Mundamore	391135	Gujarat	Vadodara
Muvada	391160	Gujarat	Vadodara
Muval	391770	Gujarat	Vadodara
Nada	391210	Gujarat	Vadodara
Nahra	391770	Gujarat	Vadodara
Nalvant	391152	Gujarat	Vadodara
Namisara	391775	Gujarat	Vadodara
Nana Amadara	391135	Gujarat	Vadodara
Nana Fofalia	391210	Gujarat	Vadodara
Nana Karala	391105	Gujarat	Vadodara
Nanderia	391105	Gujarat	Vadodara
Nandesari	391340	Gujarat	Vadodara
Nandesari Ind. estate	391340	Gujarat	Vadodara
Nandpur	391145	Gujarat	Vadodara
Nani Bhadol	391520	Gujarat	Vadodara
Nani Tokri	391165	Gujarat	Vadodara
Naria	391107	Gujarat	Vadodara
Narpura	391530	Gujarat	Vadodara
Narshihpura	391440	Gujarat	Vadodara
Naswadi	391150	Gujarat	Vadodara
Natwar Nagar	391780	Gujarat	Vadodara
Navagam	391510	Gujarat	Vadodara
Navalja	391170	Gujarat	Vadodara
Navapura	391125	Gujarat	Vadodara
Nimetha	390019	Gujarat	Vadodara
Ongc Col	390009	Gujarat	Vadodara
Oslam	391244	Gujarat	Vadodara
Padharwant	391165	Gujarat	Vadodara
Padmala	391350	Gujarat	Vadodara
Padra	391440	Gujarat	Vadodara
Pala	391150	Gujarat	Vadodara
Palasani	391152	Gujarat	Vadodara
Palaswada	391107	Gujarat	Vadodara
Palsanda	391160	Gujarat	Vadodara
Panchdevla	391510	Gujarat	Vadodara
Pandhara	391155	Gujarat	Vadodara
Pandu	391530	Gujarat	Vadodara
Panej	391140	Gujarat	Vadodara
Pani	391160	Gujarat	Vadodara
Pansoli	391110	Gujarat	Vadodara
Panvad	391168	Gujarat	Vadodara
Parikha	391210	Gujarat	Vadodara
Parvata	391150	Gujarat	Vadodara
Pasva	391520	Gujarat	Vadodara
Patarveni	391220	Gujarat	Vadodara
Pavijetpur	391160	Gujarat	Vadodara
Petrochemical	391346	Gujarat	Vadodara
Petrochemical t ship	391345	Gujarat	Vadodara
Picchuwada	391145	Gujarat	Vadodara
Pilol	391745	Gujarat	Vadodara
Pindappa	391430	Gujarat	Vadodara
Pingalvada	391240	Gujarat	Vadodara
Pipalchhat	391530	Gujarat	Vadodara
Pipaldi	391170	Gujarat	Vadodara
Pipalia	391760	Gujarat	Vadodara
Pipalsat	391145	Gujarat	Vadodara
Pipli	391445	Gujarat	Vadodara
Pisai	391111	Gujarat	Vadodara
Pochamba	391150	Gujarat	Vadodara
Poicha	391780	Gujarat	Vadodara
Por	391243	Gujarat	Vadodara
Pratapganj	390002	Gujarat	Vadodara
Pratapnagar	390004	Gujarat	Vadodara
Pratapnagar R.s.	390004	Gujarat	Vadodara
Pratappura	391774	Gujarat	Vadodara
Prathampura	391770	Gujarat	Vadodara
Puniad	391111	Gujarat	Vadodara
Puniavant	391165	Gujarat	Vadodara
Racecourse	390007	Gujarat	Vadodara
Rahkui	391510	Gujarat	Vadodara
Raichha	391168	Gujarat	Vadodara
Raika	391340	Gujarat	Vadodara
Raipur	391150	Gujarat	Vadodara
Raipura	391410	Gujarat	Vadodara
Raisingpura	391160	Gujarat	Vadodara
Rajbodeli	391140	Gujarat	Vadodara
Rajpura	391510	Gujarat	Vadodara
Rajupura	391530	Gujarat	Vadodara
Ramnath	391220	Gujarat	Vadodara
Rampura	391145	Gujarat	Vadodara
Rangpur (k)	391135	Gujarat	Vadodara
Rangpur(z)	391165	Gujarat	Vadodara
Rania	391780	Gujarat	Vadodara
Raniapura	391520	Gujarat	Vadodara
Ranjit Nagar	391780	Gujarat	Vadodara
Ranoli	391350	Gujarat	Vadodara
Ranu	391445	Gujarat	Vadodara
Rasulabad	391510	Gujarat	Vadodara
Rasulpur	391770	Gujarat	Vadodara
Ratanpur	391160	Gujarat	Vadodara
Ratanpura	391145	Gujarat	Vadodara
Raval	391760	Gujarat	Vadodara
Remeshwarpura	391761	Gujarat	Vadodara
Rodadha	391165	Gujarat	Vadodara
Rumadia	391165	Gujarat	Vadodara
Rustampura	391761	Gujarat	Vadodara
Ruvand	391220	Gujarat	Vadodara
Srp Group i	390001	Gujarat	Vadodara
Sadhli	391250	Gujarat	Vadodara
Sadra	391510	Gujarat	Vadodara
Sagwa	391105	Gujarat	Vadodara
Saidal	391761	Gujarat	Vadodara
Saidivasana	391170	Gujarat	Vadodara
Saiyed Vasna	390007	Gujarat	Vadodara
Saloj	391135	Gujarat	Vadodara
Sama	390008	Gujarat	Vadodara
Sambhoi	391240	Gujarat	Vadodara
Samiyala	391410	Gujarat	Vadodara
Samlaya R s	391520	Gujarat	Vadodara
Sampa	391240	Gujarat	Vadodara
Sampla	391421	Gujarat	Vadodara
Samra	391244	Gujarat	Vadodara
Samsabad	391107	Gujarat	Vadodara
Sanada	391165	Gujarat	Vadodara
Sandasal	391530	Gujarat	Vadodara
Sandha	391440	Gujarat	Vadodara
Sangadol	391760	Gujarat	Vadodara
Sangma	391440	Gujarat	Vadodara
Saniad	391244	Gujarat	Vadodara
Sankarda	391350	Gujarat	Vadodara
Sankhandra	391135	Gujarat	Vadodara
Sankheda	391145	Gujarat	Vadodara
Sanor	391105	Gujarat	Vadodara
Sanpur	391430	Gujarat	Vadodara
Santkawnar Colony	390006	Gujarat	Vadodara
Sarar	391240	Gujarat	Vadodara
Sarasavani	391445	Gujarat	Vadodara
Sargi	391140	Gujarat	Vadodara
Sarnej	391510	Gujarat	Vadodara
Sarsinda	391130	Gujarat	Vadodara
Sathod	391111	Gujarat	Vadodara
Savli	391770	Gujarat	Vadodara
Sayajiganj	390020	Gujarat	Vadodara
Sayajipura	390019	Gujarat	Vadodara
Segwa Simli	391155	Gujarat	Vadodara
Sejakuva	391440	Gujarat	Vadodara
Sejwa	391135	Gujarat	Vadodara
Sengpur	391152	Gujarat	Vadodara
Sevasi	391101	Gujarat	Vadodara
Shahpura	391220	Gujarat	Vadodara
Sharadnagar	390009	Gujarat	Vadodara
Sherkhi	391330	Gujarat	Vadodara
Shira	391150	Gujarat	Vadodara
Sihora	391530	Gujarat	Vadodara
Simalia	391110	Gujarat	Vadodara
Simli	391105	Gujarat	Vadodara
Simri	391244	Gujarat	Vadodara
Sindhikuva	391150	Gujarat	Vadodara
Sindhrot	391330	Gujarat	Vadodara
Singla	391168	Gujarat	Vadodara
Sinor	391115	Gujarat	Vadodara
Sisva	391740	Gujarat	Vadodara
Sitpur	391110	Gujarat	Vadodara
Sodhaliya	391152	Gujarat	Vadodara
Sokhda	391745	Gujarat	Vadodara
Sokhdaradhu	391240	Gujarat	Vadodara
Subhanpura	390023	Gujarat	Vadodara
Subhelav	391775	Gujarat	Vadodara
Sukal	391155	Gujarat	Vadodara
Sundarpura	391240	Gujarat	Vadodara
Sunderpura	391145	Gujarat	Vadodara
Surkheda	391165	Gujarat	Vadodara
T B sanatorium	390021	Gujarat	Vadodara
Tadkachhla	391135	Gujarat	Vadodara
Tajpura	391440	Gujarat	Vadodara
Tanakhala	391151	Gujarat	Vadodara
Tandalja	390012	Gujarat	Vadodara
Targol	391125	Gujarat	Vadodara
Tarsali	390009	Gujarat	Vadodara
Tatarpura	390004	Gujarat	Vadodara
Tejgadh	391160	Gujarat	Vadodara
Tentalav	391105	Gujarat	Vadodara
Thadgam	391170	Gujarat	Vadodara
Thuwavi	391107	Gujarat	Vadodara
Timba	391130	Gujarat	Vadodara
Tithor	391450	Gujarat	Vadodara
Totarmata	391125	Gujarat	Vadodara
Tulsipura	391510	Gujarat	Vadodara
Tundav	391775	Gujarat	Vadodara
Uchapan	391160	Gujarat	Vadodara
Umaraya	391440	Gujarat	Vadodara
Umarva	391160	Gujarat	Vadodara
Umathi	391170	Gujarat	Vadodara
Undera	391330	Gujarat	Vadodara
Urad	391244	Gujarat	Vadodara
Vachhesar	388710	Gujarat	Vadodara
Vadadla	391445	Gujarat	Vadodara
Vadaj	391105	Gujarat	Vadodara
Vadeli	391145	Gujarat	Vadodara
Vadia	391520	Gujarat	Vadodara
Vadodara	390001	Gujarat	Vadodara
Vadsala	391240	Gujarat	Vadodara
Vadsar	390010	Gujarat	Vadodara
Vadu	391460	Gujarat	Vadodara
Vaghodia	391760	Gujarat	Vadodara
Vaguma	391152	Gujarat	Vadodara
Vakaner	391780	Gujarat	Vadodara
Vaktapura	391530	Gujarat	Vadodara
Valan	392310	Gujarat	Vadodara
Valavav	391774	Gujarat	Vadodara
Valothi	391160	Gujarat	Vadodara
Valva	391761	Gujarat	Vadodara
Vanadara	391107	Gujarat	Vadodara
Vanchhara	391430	Gujarat	Vadodara
Vaniad	391105	Gujarat	Vadodara
Vaniadri	391135	Gujarat	Vadodara
Vankaneda	391774	Gujarat	Vadodara
Vankla	391152	Gujarat	Vadodara
Vanta	391135	Gujarat	Vadodara
Varnama	391240	Gujarat	Vadodara
Varsada	391774	Gujarat	Vadodara
Vasai	391110	Gujarat	Vadodara
Vasan Sevada	391145	Gujarat	Vadodara
Vasanpura	391770	Gujarat	Vadodara
Vasia	391530	Gujarat	Vadodara
Vasna	391140	Gujarat	Vadodara
Vasna Kotaria	391745	Gujarat	Vadodara
Vasna Road	390007	Gujarat	Vadodara
Vasvel	391760	Gujarat	Vadodara
Vedpur	391761	Gujarat	Vadodara
Vejalpura	391760	Gujarat	Vadodara
Vejpur	391535	Gujarat	Vadodara
Vemar	391520	Gujarat	Vadodara
Vemardi	391210	Gujarat	Vadodara
Vesania	391760	Gujarat	Vadodara
Vidhyut Nagar colony	390007	Gujarat	Vadodara
Vijli	391170	Gujarat	Vadodara
Vintoz	391770	Gujarat	Vadodara
Virjai	391240	Gujarat	Vadodara
Virod	390022	Gujarat	Vadodara
Virpur	391445	Gujarat	Vadodara
Vistar	391440	Gujarat	Vadodara
Vyankatpura	391510	Gujarat	Vadodara
Vyara Antoli	391760	Gujarat	Vadodara
Wadhwana	391110	Gujarat	Vadodara
Wadi S.n. road	390017	Gujarat	Vadodara
Wagach	391152	Gujarat	Vadodara
Waghodia Road	390019	Gujarat	Vadodara
Waghva	391160	Gujarat	Vadodara
Wandarda	391761	Gujarat	Vadodara
Zanzad	391115	Gujarat	Vadodara
Zer	391152	Gujarat	Vadodara
Zoz	391165	Gujarat	Vadodara`;

const runSeeder = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Parse the data
    const lines = rawData.trim().split('\n');
    const docs = [];
    const insertedPins = new Set();
    
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 4) {
        const pin = parts[1].trim();
        // Prevent duplicate keys by keeping the first occurrence
        if (!insertedPins.has(pin)) {
          docs.push({
            areaName: parts[0].trim(),
            pincode: pin,
            state: parts[2].trim(),
            district: parts[3].trim(),
          });
          insertedPins.add(pin);
        }
      }
    }

    // Insert to DB
    console.log(`Clearing old Pincodes...`);
    await Pincode.deleteMany({});
    console.log(`Inserting ${docs.length} new Pincodes...`);
    await Pincode.insertMany(docs);
    console.log('✅ Pincodes seeded successfully!');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

runSeeder();
