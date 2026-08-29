import React, { useState } from 'react';

export default function SizeGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('tops');

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay open"
      onClick={(e) =>
        e.target.classList.contains('modal-overlay') && onClose()
      }
    >
      <div className="modal">
        {/* HEADER */}
        <div className="modal-head">
          <h3>Size Guide</h3>
          <button className="modal-close" onClick={onClose}>
            &#10005;
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          {/* TABS */}
          <div className="size-tabs">
            <button
              className={`size-tab ${activeTab === 'tops' ? 'active' : ''}`}
              onClick={() => setActiveTab('tops')}
            >
              Tops
            </button>
            <button
              className={`size-tab ${activeTab === 'bottoms' ? 'active' : ''}`}
              onClick={() => setActiveTab('bottoms')}
            >
              Bottoms
            </button>
            <button
              className={`size-tab ${activeTab === 'shoes' ? 'active' : ''}`}
              onClick={() => setActiveTab('shoes')}
            >
              Shoes
            </button>
          </div>

          {/* TOPS */}
          {activeTab === 'tops' && (
            <div id="sizeTabTops">
              <table className="size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest</th>
                    <th>Waist</th>
                    <th>Hip</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>XS</td><td>34–36</td><td>28–30</td><td>34–36</td></tr>
                  <tr><td>S</td><td>36–38</td><td>30–32</td><td>36–38</td></tr>
                  <tr><td>M</td><td>38–40</td><td>32–34</td><td>38–40</td></tr>
                  <tr><td>L</td><td>40–42</td><td>34–36</td><td>40–42</td></tr>
                  <tr><td>XL</td><td>42–44</td><td>36–38</td><td>42–44</td></tr>
                  <tr><td>XXL</td><td>44–47</td><td>38–41</td><td>44–47</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {/* BOTTOMS */}
          {activeTab === 'bottoms' && (
            <div id="sizeTabBottoms">
              <table className="size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Waist</th>
                    <th>Inseam</th>
                    <th>EU</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>28</td><td>28</td><td>30</td><td>44</td></tr>
                  <tr><td>30</td><td>30</td><td>30/32</td><td>46</td></tr>
                  <tr><td>32</td><td>32</td><td>30/32</td><td>48</td></tr>
                  <tr><td>34</td><td>34</td><td>32</td><td>50</td></tr>
                  <tr><td>36</td><td>36</td><td>32</td><td>52</td></tr>
                  <tr><td>38</td><td>38</td><td>32/34</td><td>54</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {/* SHOES */}
          {activeTab === 'shoes' && (
            <div id="sizeTabShoes">
              <table className="size-table">
                <thead>
                  <tr>
                    <th>US</th>
                    <th>UK</th>
                    <th>EU</th>
                    <th>CM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>7</td><td>6</td><td>40</td><td>25</td></tr>
                  <tr><td>8</td><td>7</td><td>41</td><td>26</td></tr>
                  <tr><td>9</td><td>8</td><td>42</td><td>27</td></tr>
                  <tr><td>10</td><td>9</td><td>43</td><td>28</td></tr>
                  <tr><td>11</td><td>10</td><td>44</td><td>29</td></tr>
                  <tr><td>12</td><td>11</td><td>46</td><td>30</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TIP */}
          <div className="modal-tip">
            <strong>How to measure:</strong>
            <br />
            Chest around fullest part, waist at narrowest. If between sizes, size up.
          </div>
        </div>
      </div>
    </div>
  );
}