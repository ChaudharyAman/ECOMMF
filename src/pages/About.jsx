import React from 'react';
import { ArrowRight, Heart, Users, Globe, Award, Leaf, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="font-sans text-stone-800 bg-[#FDFBF7] min-h-screen pt-16">
            
            {/* --- Hero Section --- */}
            <section className="relative px-6 py-24 text-center overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent"></div>
                <div className="max-w-4xl mx-auto space-y-8 relative z-10 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm mx-auto">
                        <Heart className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold tracking-widest uppercase text-stone-600">Our Story</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-serif text-stone-900 leading-tight">
                        The Art of <br />
                        <span className="italic text-stone-500">Meaningful</span> Giving.
                    </h1>
                    
                    <p className="text-xl text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
                        We believe that a gift is more than just an object. It's a memory, a connection, and a silent language of love.
                    </p>
                </div>
            </section>

            {/* --- Visual Mosaic --- */}
            <section className="px-6 pb-24">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
                    {/* Main Image */}
                    <div className="md:col-span-8 relative rounded-3xl overflow-hidden h-96 md:h-full group">
                        <img 
                            src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=2670&auto=format&fit=crop" 
                            alt="The artisan process" 
                            className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-stone-900/10"></div>
                        <div className="absolute bottom-8 left-8 text-white max-w-md">
                            <h3 className="text-3xl font-serif mb-2">Uncompromising Craft</h3>
                            <p className="text-white/90 font-light">Every item in our collection is hand-selected for its quality and story.</p>
                        </div>
                    </div>
                    
                    {/* Side Images */}
                    <div className="md:col-span-4 grid grid-rows-2 gap-6">
                        <div className="relative rounded-3xl overflow-hidden group">
                             <img 
                                src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=2515&auto=format&fit=crop" 
                                alt="Sustainable Packaging" 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                             />
                             <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/0 transition-colors"></div>
                        </div>
                        <div className="bg-stone-900 rounded-3xl p-8 flex flex-col justify-center text-white text-center space-y-4">
                            <Globe className="w-10 h-10 mx-auto text-amber-500" />
                            <h3 className="text-2xl font-serif">Global Curations</h3>
                            <p className="text-stone-400 font-light text-sm">Sourced from independent artisans around the world.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Our Values --- */}
            <section className="py-24 bg-white px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4">
                            <div className="w-16 h-16 rounded-full bg-[#FDFBF7] flex items-center justify-center mx-auto mb-6">
                                <Award className="w-8 h-8 text-stone-800" />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 uppercase tracking-wide">Excellence</h3>
                            <p className="text-stone-600 leading-relaxed font-light">
                                We obsess over details. From the stitching on a leather bag to the scent of a candle, nothing is overlooked.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-16 h-16 rounded-full bg-[#FDFBF7] flex items-center justify-center mx-auto mb-6">
                                <Leaf className="w-8 h-8 text-stone-800" />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 uppercase tracking-wide">Sustainability</h3>
                            <p className="text-stone-600 leading-relaxed font-light">
                                Thoughtful gifting shouldn't cost the earth. We prioritize eco-friendly materials and ethical production.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-16 h-16 rounded-full bg-[#FDFBF7] flex items-center justify-center mx-auto mb-6">
                                <Users className="w-8 h-8 text-stone-800" />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 uppercase tracking-wide">Community</h3>
                            <p className="text-stone-600 leading-relaxed font-light">
                                We support small makers and creators, bringing their stories and talents to a wider audience.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- The Narrative --- */}
            <section className="py-24 px-6 lg:px-12">
                 <div className="max-w-4xl mx-auto text-center space-y-12">
                     <span className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase">Since 2015</span>
                     
                     <div className="space-y-8">
                         <h2 className="text-4xl md:text-5xl font-serif text-stone-900 leading-tight">
                             "We started with a simple idea: <br/>To bring back the joy of slow, intentional living."
                         </h2>
                         
                         <div className="prose prose-lg prose-stone mx-auto font-light text-stone-600">
                             <p>
                                 In a world of instant gratification and digital noise, we wanted to create a sanctuary for the tangible. 
                                 A place where objects had weight, texture, and history. What began as a small curated shop in a quiet corner of the city 
                                 has grown into a global destination for those who seek beauty in the everyday.
                             </p>
                             <p>
                                 Our team travels far and wide to find pieces that resonate with our philosophy. 
                                 Whether it's a hand-thrown ceramic mug or a woven wool throw, every item in our store has been chosen 
                                 because it sparked a feeling in us—a feeling we hope to pass on to you.
                             </p>
                         </div>
                     </div>

                     <div className="pt-8">
                         <img 
                            src="https://signature.ux-maestro.com/signature.png" 
                            alt="Founder Signature" 
                            className="h-16 mx-auto opacity-60" 
                            /* Placeholder for signature. In real app, use asset. Using text fallback for now if image fails. */
                            onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='block'}}
                         />
                     </div>
                 </div>
            </section>

             {/* --- CTA --- */}
             <section className="py-24 bg-stone-900 text-white text-center px-6">
                 <div className="max-w-2xl mx-auto space-y-8">
                     <h2 className="text-4xl font-serif">Be Part of Our Journey</h2>
                     <p className="text-stone-400 font-light text-lg">
                         Discover our latest collections and find your new favorite piece today.
                     </p>
                     <Link to="/products" className="inline-block px-10 py-4 bg-white text-stone-900 rounded-full font-bold uppercase tracking-widest hover:bg-[#FDFBF7] transition-all hover:scale-105">
                         Explore Collection
                     </Link>
                 </div>
             </section>

        </div>
    );
};

export default About;
